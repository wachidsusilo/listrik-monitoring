import { useEffect, useRef, useState } from 'react'
import useSensor from '../../hooks/UseSensor'
import { SensorType } from '../../model/sensor'
import { getPrecision } from '../../utility/utils'

type Color = 'red' | 'green' | 'blue' | 'purple' | 'orange'

interface Props {
    className?: string
    color?: Color
    sensorType?: SensorType
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

const SensorCard = ({className = '', color = 'blue', sensorType = 'sensor1'}: Props) => {
    const [columnMode, setColumnMode] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const data = useSensor()

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

    return (
        <div ref={containerRef} className={`relative w-full flex flex-col bg-white shadow rounded-[8px] overflow-hidden ${className}`}>
            <div className={`absolute left-0 w-[6px] h-full ${getBackgroundColor(color)}`}></div>
            <div className={`w-full px-8 mt-4 text-sm font-medium select-none ${getTextColor(color)}`}>
                {data[sensorType].name}
            </div>
            <div className={`w-full mx-8 grid ${columnMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className='w-full mt-2 flex flex-col'>
                    <span className='text-gray-500 text-sm select-none'>Energy (kWh)</span>
                    <span className="text-gray-600 text-xl font-medium select-none">
                        {data[sensorType].energy.toFixed(getPrecision(data[sensorType].energy))}
                    </span>
                </div>
                <div className='w-full mt-2 mb-4 flex flex-col'>
                    <span className='text-gray-500 text-sm select-none'>Power (W)</span>
                    <span className="text-gray-600 text-xl font-medium select-none">
                        {data[sensorType].power.toFixed(getPrecision(data[sensorType].power))}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default SensorCard