import SensorCard, { Color } from './SensorCard'
import { collator } from '../../utility/utils'
import useDevice from '../../hooks/UseDevice'

interface Props {
    className?: string
}

const getColor = (index: number): Color => {
    switch (index % 4) {
        case 0:
            return 'purple'
        case 1:
            return 'green'
        case 2:
            return 'blue'
        case 3:
            return 'orange'
        default:
            return 'red'
    }
}

const SensorRow = ({className = ''}: Props) => {
    const {deviceData} = useDevice()

    return (
        <div className={`w-full grid grid-cols-1 xs:grid-cols-2 lg:!grid-cols-4 gap-8 ${className}`}>
            {
                Object.keys(deviceData).sort(collator.compare).map((value, index) => (
                    <SensorCard key={index * 4 + 1} deviceId={value} color={getColor(index)}/>
                ))
            }
        </div>
    )
}

export default SensorRow