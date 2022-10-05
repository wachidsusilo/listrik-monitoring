import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import useFirebase from './UseFirebase'
import { SensorData } from '../model/sensor'

interface ISensorContext {
    sensorData: SensorData
}

const SensorContext = createContext<ISensorContext>({
    sensorData: {}
})

interface SensorProviderProps {
    children: ReactNode
}

export const SensorProvider = ({children}: SensorProviderProps) => {
    const [sensorData, setSensorData] = useState<SensorData>({})
    const { onValueSensor } = useFirebase()

    useEffect(() => {
        const unsub = onValueSensor((sensor) => {
            setSensorData(sensor)
        })

        return () => {
            unsub()
        }
    }, [])

    return (
        <SensorContext.Provider value={{sensorData}}>
            {children}
        </SensorContext.Provider>
    )
}

export default function useSensor() {
    return useContext(SensorContext)
}