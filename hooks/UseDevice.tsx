import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import useFirebase from './UseFirebase'
import { ExtendedDeviceData } from '../model/device'
import { collator } from '../utility/utils'

interface IDeviceContext {
    online: boolean
    lastOnline: number
    lastUpdate: number
    deviceData: ExtendedDeviceData
    setDeviceName(deviceId: string, name: string): void
    getDeviceName(deviceId: string): string
}

const DeviceContext = createContext<IDeviceContext>({
    online: false,
    lastOnline: 0,
    lastUpdate: 0,
    deviceData: {},
    setDeviceName() {},
    getDeviceName(){return ''}
})

interface DeviceProviderProps {
    children: ReactNode
}

export const DeviceProvider = ({children}: DeviceProviderProps) => {
    const [online, setOnline] = useState<boolean>(false)
    const [lastOnline, setLastOnline] = useState<number>(0)
    const [lastUpdate, setLastUpdate] = useState<number>(0)
    const [deviceData, setDeviceData] = useState<ExtendedDeviceData>({})
    const {onValueDevice, setDevice} = useFirebase()

    const setDeviceName = (deviceId: string, name: string) => {
        setDevice(deviceId, 'name', name)
    }

    const getDeviceName = (deviceId: string): string => {
        if (deviceData[deviceId]) {
            return deviceData[deviceId].name
        }
        return deviceId
    }

    useEffect(() => {
        const unsub = onValueDevice((lastOnline, lastUpdate, data) => {
            setOnline(Date.now() - lastOnline < 120000)
            setLastOnline(lastOnline)
            setLastUpdate(lastUpdate)

            const devices = Object.keys(data)
                .sort(collator.compare)
                .reduce<ExtendedDeviceData>((acc, key) => {
                    acc[key] = {
                        online: Date.now() - data[key].lastOnline < 120000,
                        name: data[key].name,
                        lastOnline: data[key].lastOnline,
                        lastUpdate: data[key].lastUpdate
                    }
                    return acc
                }, {})
            setDeviceData(devices)
        })

        return () => {
            unsub()
        }
    }, [])

    return (
        <DeviceContext.Provider value={{online, lastOnline, lastUpdate, deviceData, setDeviceName, getDeviceName}}>
            {children}
        </DeviceContext.Provider>
    )
}

export default function useDevice() {
    return useContext(DeviceContext)
}