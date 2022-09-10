import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import useFirebase from './UseFirebase'
import { isSensorEqual, Sensor, SensorData } from '../model/sensor'

const SensorContext = createContext<SensorData>({
    sensor1: {name: '', energy: 0, power: 0},
    sensor2: {name: '', energy: 0, power: 0},
    sensor3: {name: '', energy: 0, power: 0},
    sensor4: {name: '', energy: 0, power: 0}
})

interface SensorProviderProps {
    children: ReactNode
}

export const SensorProvider = ({children}: SensorProviderProps) => {
    const [sensor1, setSensor1] = useState<Sensor>({name: 'Sensor 1', energy: 0, power: 0})
    const [sensor2, setSensor2] = useState<Sensor>({name: 'Sensor 2', energy: 0, power: 0})
    const [sensor3, setSensor3] = useState<Sensor>({name: 'Sensor 3', energy: 0, power: 0})
    const [sensor4, setSensor4] = useState<Sensor>({name: 'Sensor 4', energy: 0, power: 0})
    const { onValueSensor } = useFirebase()

    useEffect(() => {
        const unsub = onValueSensor((sensor) => {
            setSensor1((value) => {
                if (!isSensorEqual(value, sensor.sensor1)) {
                    return sensor.sensor1
                }
                return value
            })
            setSensor2((value) => {
                if (!isSensorEqual(value, sensor.sensor2)) {
                    return sensor.sensor2
                }
                return value
            })
            setSensor3((value) => {
                if (!isSensorEqual(value, sensor.sensor3)) {
                    return sensor.sensor3
                }
                return value
            })
            setSensor4((value) => {
                if (!isSensorEqual(value, sensor.sensor4)) {
                    return sensor.sensor4
                }
                return value
            })
        })

        return () => {
            unsub()
        }
    }, [])

    return (
        <SensorContext.Provider value={{sensor1, sensor2, sensor3, sensor4}}>
            {children}
        </SensorContext.Provider>
    )
}

export default function useSensor() {
    return useContext(SensorContext)
}