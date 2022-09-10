import SensorCard from './SensorCard'
import { SensorProvider } from '../../hooks/UseSensor'

interface Props {
    className?: string
}

const SensorRow = ({className = ''}: Props) => {
    return (
        <SensorProvider>
            <div className={`w-full grid grid-cols-1 xs:grid-cols-2 lg:!grid-cols-4 gap-8 ${className}`}>
                <SensorCard sensorType='sensor1' color='purple' />
                <SensorCard sensorType='sensor2' color='green' />
                <SensorCard sensorType='sensor3' color='blue' />
                <SensorCard sensorType='sensor4' color='orange' />
            </div>
        </SensorProvider>
    )
}

export default SensorRow