import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { isSensorTotalData, SensorTotalData } from '../model/sensor'
import { PeriodType } from '../model/date'
import useSensor from './UseSensor'

interface IChart {
    data: Array<SensorTotalData>
    loading: boolean
    periodType: PeriodType
    setPeriodType(period: PeriodType): void
}

const ChartContext = createContext<IChart>({
    data: [],
    loading: false,
    periodType: 'today',
    setPeriodType() {}
})

interface ChartProviderProps {
    children: ReactNode
}

export const ChartProvider = ({children}: ChartProviderProps) => {
    const [data, setData] = useState<Array<SensorTotalData>>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [periodType, setPeriodType] = useState<PeriodType>('today')
    const {sensor1, sensor2, sensor3, sensor4} = useSensor()
    const lastMillisRef = useRef<number>(0)

    const fetchData = (signal: AbortSignal, onDone?: () => void, onError?: (e: any) => void) => {
        fetch(`/api/data?type=${periodType}`, {signal})
            .then(result => result.json())
            .then(result => {
                const data = result.data
                if (data && typeof data === 'object' && Array.isArray(data)) {
                    setData(data.filter(value => isSensorTotalData(value)))
                }
            })
            .catch((e)=>{
                if (onError) {
                    onError(e)
                }
            })
            .finally(() => {
                if (onDone) {
                    onDone()
                }
            })
    }

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)
        fetchData(controller.signal, () => {
            setLoading(false)
        })

        if (periodType === 'today') {
            lastMillisRef.current = Date.now()
        }

        return () => {
            controller.abort()
        }
    }, [periodType])

    useEffect(() => {
        if (periodType !== 'today') {
            return
        }
        const controller = new AbortController()

        if (Date.now() - lastMillisRef.current >= 60000) {
            lastMillisRef.current = Date.now()
            fetchData(controller.signal)
        }

        return () => {
            controller.abort()
        }
    }, [periodType, sensor1, sensor2, sensor3, sensor4])

    return (
        <ChartContext.Provider value={{
            data,
            loading,
            periodType,
            setPeriodType
        }}>
            {children}
        </ChartContext.Provider>
    )
}

export default function useChart() {
    return useContext(ChartContext)
}
