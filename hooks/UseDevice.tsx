import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import useFirebase from './UseFirebase'
import { Device } from '../model/device'

const DeviceContext = createContext<Device>({
    online: false,
    lastOnline: 0,
    lastUpdate: 0
})

interface DeviceProviderProps {
    children: ReactNode
}

export const DeviceProvider = ({children}: DeviceProviderProps) => {
    const [online, setOnline] = useState<boolean>(false)
    const [lastOnline, setLastOnline] = useState<number>(0)
    const [lastUpdate, setLastUpdate] = useState<number>(0)
    const {onValueDevice} = useFirebase()

    useEffect(() => {
        const unsub = onValueDevice((device) => {
            setOnline(device.online)
            setLastOnline(device.lastOnline)
            setLastUpdate(device.lastUpdate)
        })

        return () => {
            unsub()
        }
    }, [])

    return (
        <DeviceContext.Provider value={{online, lastOnline, lastUpdate}}>
            {children}
        </DeviceContext.Provider>
    )
}

export default function useDevice() {
    return useContext(DeviceContext)
}