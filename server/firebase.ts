import admin from 'firebase-admin'
import { serviceAccount } from './secret'
import { isSensorValueData, SensorData, SensorTotalData, SensorValueData } from '../model/sensor'
import { isRelay, Relay, RelayData, RelayType, relayTypes } from '../model/relay'
import { sendRelayToDevice } from './socket'
import { formatTime } from '../utility/utils'
import { PeriodType } from '../model/date'

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://listrik-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app',
})

const db = admin.database(app)
const sensor = db.ref('sensor')
const relay = db.ref('relay')
const device = db.ref('device')
const metadata = db.ref('metadata')
const data = db.ref('data')

const relayData: RelayData = {
    relay1: {name: '', on: 0, off: 0, auto: false, state: false},
    relay2: {name: '', on: 0, off: 0, auto: false, state: false},
    relay3: {name: '', on: 0, off: 0, auto: false, state: false},
    relay4: {name: '', on: 0, off: 0, auto: false, state: false},
}
let lastUpdate = 0

export const setSensorData = (sensorData: SensorData) => {
    sensor.update(sensorData).then()
}

export const setRelay = (relayType: RelayType, relayData: Relay) => {
    relay.child(relayType).update(relayData).then()
}

export const setDeviceOnline = (online: boolean) => {
    device.update({
        online,
        lastOnline: Date.now()
    }).then()
}

const now = () => {
    return new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000 + 25200000)
}

export const storeSensor = (sensorData: SensorData, dateTime: Date = now()) => {
    const year = dateTime.getFullYear().toString()
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
    const date = (dateTime.getDate()).toString().padStart(2, '0')
    const time = (dateTime.getHours() * 60 + dateTime.getMinutes()).toString().padStart(4, '0')

    const sensorValue: SensorValueData = {
        sensor1: {energy: sensorData.sensor1.energy, power: sensorData.sensor1.power},
        sensor2: {energy: sensorData.sensor2.energy, power: sensorData.sensor2.power},
        sensor3: {energy: sensorData.sensor3.energy, power: sensorData.sensor3.power},
        sensor4: {energy: sensorData.sensor4.energy, power: sensorData.sensor4.power},
    }

    lastUpdate = Date.now()
    device.child('lastUpdate').set(lastUpdate).then()
    metadata.child(year).child(month).child(date).set(dateTime.getDate()).then()
    data.child(year).child(month).child(date).child(time).set(sensorValue).then()
}

relayTypes.forEach((value) => {
    relay.child(value).on('value', (snapshot) => {
        const data = snapshot.val()
        if (isRelay(data)) {
            relayData[value] = data
            sendRelayToDevice({
                type: 'relay',
                data,
                target: value
            })
        }
    })
})

device.child('lastUpdate').on('value', (snapshot) => {
    const data = snapshot.val()
    if (typeof data === 'number') {
        lastUpdate = data
    }
})

export const getLastUpdate = () => {
    return lastUpdate
}

export const getRelayData = (relayType: RelayType) => {
    return relayData[relayType]
}

const collator = Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})
const validate = (sensorData: any) => {
    return sensorData && typeof sensorData === 'object' && !Array.isArray(sensorData)
}

const fetchDataOfTheDay = async (year: string, month: string, day: string, lastDataOnly: boolean = false): Promise<Array<SensorTotalData> | null> => {
    let sensorData: any

    if (lastDataOnly) {
        sensorData = (await data.child(year).child(month).child(day).orderByKey().limitToLast(1).get()).val()
    } else {
        sensorData = (await data.child(year).child(month).child(day).get()).val()
    }

    if (!validate(sensorData)) {
        return null
    }

    return Object.keys(sensorData)
        .filter(value => isSensorValueData(sensorData[value]))
        .sort(collator.compare)
        .map(key => {
            const svd = sensorData[key] as SensorValueData
            return {
                dateTime: `${year}-${month}-${day}T${formatTime(Number.parseInt(key))}`,
                total: {
                    energy: svd.sensor1.energy + svd.sensor2.energy + svd.sensor3.energy + svd.sensor4.energy,
                    power: svd.sensor1.power + svd.sensor2.power + svd.sensor3.power + svd.sensor4.power
                }
            }
        })
}

const fetchDataPerDay = async (year: string, month: string, dayList: any): Promise<Array<SensorTotalData>> => {
    if (!validate(dayList)) {
        return []
    }

    const dataPerDay: Array<SensorTotalData> = []
    const days = Object.keys(dayList).sort(collator.compare)
    for (const day of days) {
        const result = await fetchDataOfTheDay(year, month, day, true)
        if (result && result.length > 0) {
            dataPerDay.push(result[0])
        }
    }
    return dataPerDay
}

const fetchDataOfTheYear = async (year: string): Promise<Array<SensorTotalData>> => {
    const monthList = (await metadata.child(year).get()).val()
    if (!validate(monthList)) {
        return []
    }

    const dataOfTheYear: Array<SensorTotalData> = []
    const months = Object.keys(monthList).sort(collator.compare)
    for (const month of months) {
        const dayList = monthList[month]
        dataOfTheYear.push(...(await fetchDataPerDay(year, month, dayList)))
    }
    return dataOfTheYear
}

export const getData = async (periodType: PeriodType): Promise<Array<SensorTotalData>> => {
    const date = new Date()

    if (periodType === 'today' || periodType === 'yesterday') {
        if (periodType === 'yesterday') {
            date.setDate(date.getDate() - 1)
        }

        const year = date.getFullYear().toString().padStart(4, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')

        return await fetchDataOfTheDay(year, month, day) ?? []
    }

    if (periodType === 'this-week' || periodType === 'this-month') {
        const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0')
        const currentDay = date.getDate().toString().padStart(2, '0')

        if (periodType === 'this-week') {
            date.setDate(date.getDate() - date.getDay())
        }

        const year = date.getFullYear().toString().padStart(4, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const startDay = date.getDate().toString().padStart(2, '0')

        let result: Array<SensorTotalData>

        if (periodType === 'this-week') {
            if (currentMonth === month) {
                const dayList = (await metadata.child(year).child(month).orderByKey().startAt(startDay).get()).val()
                result = await fetchDataPerDay(year, month, dayList)
            } else {
                const dayListOfPrevMonth = (await metadata.child(year).child(month).orderByKey().startAt(startDay).get()).val()
                const dayListOfCurrentMonth = (await metadata.child(year).child(currentMonth).orderByKey().endAt(currentDay).get()).val()
                result = [
                    ...(await fetchDataPerDay(year, month, dayListOfPrevMonth)),
                    ...(await fetchDataPerDay(year, currentMonth, dayListOfCurrentMonth))
                ]
            }
        } else {
            const dayList = (await metadata.child(year).child(month).get()).val()
            result = await fetchDataPerDay(year, month, dayList)
        }

        return result
    }

    if (periodType === 'this-year') {
        const year = date.getFullYear().toString().padStart(4, '0')
        return await fetchDataOfTheYear(year)
    }

    const yearList = (await metadata.get()).val()
    if (!validate(yearList)) {
        return []
    }

    const allData: Array<SensorTotalData> = []
    const years = Object.keys(yearList).sort(collator.compare)
    for (const year of years) {
        allData.push(...(await fetchDataOfTheYear(year)))
    }
    return allData
}

setDeviceOnline(false)
