import DatabaseTable from './DatabaseTable'
import SnakeBar from '../SnakeBar'
import { DatabaseProvider } from '../../hooks/UseDatabase'
import DatabaseFilter from './DatabaseFilter'
import { SensorProvider } from '../../hooks/UseSensor'

interface Props {
    className?: string
}

const DatabaseContent = ({className = ''}: Props) => {
    return (
        <DatabaseProvider>
            <SensorProvider>
                <div className={`relative w-full h-full flex flex-col overflow-hidden  ${className}`}>
                    <h2 className='shrink-0 mt-8 mx-8 text-gray-800 text-3xl select-none'>Database</h2>
                    <DatabaseFilter className='mt-4' />
                    <div className='h-full w-full mt-8 flex overflow-y-hidden scrollbar-thin-blue'>
                        <div className='h-full grow px-8 flex'>
                            <DatabaseTable className='mb-4' />
                        </div>
                    </div>
                    <SnakeBar />
                </div>
            </SensorProvider>
        </DatabaseProvider>
    )
}

export default DatabaseContent