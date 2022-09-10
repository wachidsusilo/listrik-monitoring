import { WebSocket } from 'ws'
import { isSensorData, SensorData } from '../model/sensor'
import { isRelay, isValidRelayType, Relay, RelayType, relayTypes } from '../model/relay'
import { isValidToken } from './secret'
import { getLastUpdate, setRelay, setSensorData, setDeviceOnline, storeSensor, getRelayData } from './firebase'
import { findClientById, getClients } from './index'
import {v4 as UUID} from 'uuid'

type Object = { [ket: string]: any }

const payloadTypes = ['sensor', 'relay', 'reg'] as const
type PayloadType = typeof payloadTypes[number]

interface Reg {
    id: string
    token: string
}

interface Payload<Type> {
    type: PayloadType
    data: Type
    target?: RelayType
}

const isReg = (obj: Object): obj is Reg => {
    return obj && typeof obj === 'object' && !Array.isArray(obj)
        && typeof obj.id === 'string'
        && typeof obj.token === 'string'
}

const isPayload = (obj: Object): obj is Payload<Object> => {
    return obj && typeof obj === 'object' && !Array.isArray(obj)
        && payloadTypes.includes(obj.type)
        && obj.data && typeof obj.data === 'object'
}

const isPayloadReg = (obj: Object): obj is Payload<Reg> => {
    return isPayload(obj) && obj.type === 'reg' && isReg(obj.data)
}

const isPayloadSensor = (obj: Object): obj is Payload<SensorData> => {
    return isPayload(obj) && obj.type === 'sensor' && isSensorData(obj.data)
}

const isPayloadRelay = (obj: Object): obj is Payload<Relay> => {
    return isPayload(obj) && obj.type === 'relay' && isRelay(obj.data)
}

const sendMessage = (socket: WebSocket, code: number, name: string, message: string) => {
    socket.send(JSON.stringify({code, name, message}))
}

export const sendRelayToDevice = (payload: Payload<Relay>) => {
    getClients().forEach((client) => {
        client.send(JSON.stringify(payload))
    })
}

export interface Client extends WebSocket {
    id: string
    uid: string
    isAlive: boolean
    intervalId: NodeJS.Timer
    reconnected: boolean
    lastSensorUpdate: number
}

export const devConnection = (socket: WebSocket) => {
    const client = socket as Client

    client.onmessage = (e) => {
        if (typeof e.data === 'string') {
            try {
                const payload = JSON.parse(e.data)
                if (isPayloadReg(payload)) {
                    if (payload.data.id.trim().length < 36) {
                        sendMessage(client, 401, 'reg/invalid_id', 'The id provided was invalid.')
                        return
                    }
                    if (!isValidToken(payload.data.id, payload.data.token)) {
                        sendMessage(client, 401, 'reg/invalid_token', 'The token provided was invalid.')
                        return
                    }

                    const oldClient = findClientById(client.id)
                    if (oldClient) {
                        oldClient.reconnected = true
                        client.lastSensorUpdate = oldClient.lastSensorUpdate
                        oldClient.close()
                    }

                    client.id = payload.data.id
                    client.uid = UUID()
                    client.isAlive = true
                    client.reconnected = false
                    client.intervalId = setInterval(() => {
                        if (client.isAlive) {
                            client.isAlive = false
                            client.ping()
                        } else {
                            client.close()
                        }
                    }, 15000)

                    relayTypes.forEach((value) => {
                        const payloadRelay: Payload<Relay> = {
                            type: 'relay',
                            data: getRelayData(value),
                            target: value
                        }
                        client.send(JSON.stringify(payloadRelay))
                    })

                    setDeviceOnline(true)
                    sendMessage(client, 200, 'reg/ok', 'Client has been registered successfully.')
                } else if (isPayloadSensor(payload)) {
                    if (!client.id) {
                        sendMessage(client, 401, 'sensor/unauthorized', 'Sensor field is only available for authorized client.')
                        return
                    }

                    if (client.lastSensorUpdate && Date.now() - client.lastSensorUpdate < 1000) {
                        sendMessage(client, 429, 'sensor/rate_exceeded', 'Sensor update rate limit has been exceeded.')
                        return
                    }
                    client.lastSensorUpdate = Date.now()

                    setSensorData(payload.data)
                    if (Date.now() - getLastUpdate() >= 60000) {
                        storeSensor(payload.data)
                    }
                    sendMessage(client, 200, 'sensor/ok', 'Sensor has been set successfully.')
                } else if (isPayloadRelay(payload)) {
                    if (!client.id) {
                        sendMessage(client, 401, 'relay/unauthorized', 'Relay field is only available for authorized client.')
                        return
                    }

                    const relayType = payload.target
                    if (!isValidRelayType(relayType)) {
                        sendMessage(client, 401, 'relay/invalid_target', 'The payload sent has invalid target.')
                        return
                    }

                    setRelay(relayType, payload.data)
                    sendMessage(client, 200, 'relay/ok', `Relay ${relayType} has been set successfully.`)
                } else {
                    sendMessage(client, 400, 'data/invalid_structure', 'The data sent has invalid structure.')
                }
            } catch (e) {
                sendMessage(client, 400, 'data/invalid_structure', 'The data sent has invalid structure.')
            }
        } else {
            sendMessage(client, 400, 'data/invalid_structure', 'The data sent has invalid structure.')
        }
    }

    client.on('pong', () => {
        client.isAlive = true
    })

    client.onclose = () => {
        if (client.id && !client.reconnected) {
            client.id = ''
            setDeviceOnline(false)
        }
        clearInterval(client.intervalId)
    }
}