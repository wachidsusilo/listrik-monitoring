import { useEffect, useRef, useState } from 'react'
import useSensor from '../../hooks/UseSensor'
import { getPrecision, momentElapsedTime } from '../../utility/utils'
import useDevice from '../../hooks/UseDevice'

export type Color = 'red' | 'green' | 'blue' | 'purple' | 'orange'

interface Props {
    className?: string
    color?: Color
    deviceId?: string
}

const getBackgroundColor = (color: Color) => {
    switch (color) {
        case 'red':
            return 'bg-red-500'
        case 'green':
            return 'bg-green-500'
        case 'blue':
            return 'bg-blue-500'
        case 'orange':
            return 'bg-orange-500'
        case 'purple':
            return 'bg-purple-500'
    }
    return ''
}

const getTextColor = (color: Color) => {
    switch (color) {
        case 'red':
            return 'text-red-500'
        case 'green':
            return 'text-green-500'
        case 'blue':
            return 'text-blue-500'
        case 'orange':
            return 'text-orange-500'
        case 'purple':
            return 'text-purple-500'
    }
    return ''
}

const SensorCard = ({className = '', color = 'blue', deviceId = 'device1'}: Props) => {
    const [columnMode, setColumnMode] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const {getDeviceName, deviceData} = useDevice()
    const {sensorData} = useSensor()

    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === container) {
                    const width = entry.borderBoxSize[0]?.inlineSize
                    if (!width) {
                        return
                    }

                    setColumnMode(width < 250)
                }
            }
        })

        resizeObserver.observe(container)

        return () => {
            resizeObserver.observe(container)
        }
    }, [containerRef.current])

    if (!sensorData[deviceId]) {
        return (
            <div ref={containerRef}
                 className={`relative w-full flex flex-col items-center justify-center bg-white shadow rounded-[8px] 
                 overflow-hidden ${columnMode ? 'h-[180px]' : 'h-[128px]'} ${className}`}>
                <div className={`absolute left-0 w-[6px] h-full ${getBackgroundColor(color)}`}></div>
                <div className={`w-full px-8 mt-4 text-sm font-medium select-none ${getTextColor(color)}`}>
                    {getDeviceName(deviceId)}
                </div>
                <div className={`w-full px-8 mt-0.5 items-center flex select-none text-gray-400`}>
                    <div
                        className={`w-2 h-2 shrink-0 rounded-full ${deviceData[deviceId].online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div
                        className="ml-2 text-xs text-ellipsis whitespace-nowrap overflow-hidden">
                        {deviceData[deviceId].online ? 'Online' : momentElapsedTime(deviceData[deviceId].lastOnline)}
                    </div>
                </div>
                <div className="w-full px-8 grow flex items-center justify-center">
                    <div className="w-8 h-8 border-[2px] border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef}
             className={`relative w-full flex flex-col bg-white shadow rounded-[8px] overflow-hidden ${className}`}>
            <div className={`absolute left-0 w-[6px] h-full ${getBackgroundColor(color)}`}></div>
            <div className={`w-full px-8 mt-4 text-sm font-medium select-none ${getTextColor(color)}`}>
                {getDeviceName(deviceId)}
            </div>
            <div className={`w-full px-8 mt-0.5 items-center flex select-none text-gray-400`}>
                <div
                    className={`w-2 h-2 shrink-0 rounded-full ${deviceData[deviceId].online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div
                    className="ml-2 text-xs text-ellipsis whitespace-nowrap overflow-hidden">
                    {deviceData[deviceId].online ? 'Online' : momentElapsedTime(deviceData[deviceId].lastOnline)}
                </div>
            </div>
            <div className={`w-full mx-8 mt-0.5 grid ${columnMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="w-full mt-2 flex flex-col">
                    <div className="text-gray-500 text-sm select-none">Energi (kWh)</div>
                    <div className="text-gray-600 text-xl font-medium select-none">
                        {sensorData[deviceId].energy.toFixed(getPrecision(sensorData[deviceId].energy))}
                    </div>
                </div>
                <div className={`w-full mb-4 flex flex-col ${columnMode ? 'mt-1' : 'mt-2'}`}>
                    <div className="text-gray-500 text-sm select-none">Daya (W)</div>
                    <div className="text-gray-600 text-xl font-medium select-none">
                        {sensorData[deviceId].power.toFixed(getPrecision(sensorData[deviceId].power))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SensorCard