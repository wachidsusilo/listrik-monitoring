import SensorRow from './SensorRow'
import SensorChart from './SensorChart'
import SnakeBar from '../SnakeBar'
import { ChartProvider } from '../../hooks/UseChart'
import { SensorProvider } from '../../hooks/UseSensor'

interface Props {
    className?: string
}

const DashboardContent = ({className = ''}: Props) => {
    return (
        <div
            className={`relative w-full h-auto min-h-[calc(100%-60px)] p-8 flex flex-col overflow-x-hidden overflow-y-auto xs:overflow-hidden scrollbar-thin-blue ${className}`}>
            <h2 className="shrink-0 text-gray-800 text-3xl select-none">Dashboard</h2>
            <SensorProvider>
                <SensorRow className="my-12 shrink-0"/>
            </SensorProvider>
            <ChartProvider>
                <SensorChart/>
            </ChartProvider>
            <SnakeBar/>
        </div>
    )
}

export default DashboardContent