import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { SensorTotalData } from '../model/sensor'
import { PeriodType } from '../model/date'
import useSensor from './UseSensor'
import useFirebase from './UseFirebase'

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
    const {sensorData} = useSensor()
    const {getDataOfPeriod} = useFirebase()
    const lastMillisRef = useRef<number>(0)

    const fetchData = (signal: AbortSignal, onDone?: () => void, onError?: (e: any) => void) => {
        getDataOfPeriod(periodType)
            .then((result) => {
                if (!signal.aborted) {
                    setData(result)
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
    }, [periodType, sensorData])

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
