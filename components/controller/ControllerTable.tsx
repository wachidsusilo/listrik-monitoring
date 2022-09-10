import { RelayProvider } from '../../hooks/UseRelay'
import ControllerRow from './ControllerRow'

interface Props {
    className?: string
}

const titles = ['Relay', 'ON', 'OFF', 'Auto', 'Status']

const ControllerTable = ({className = ''}: Props) => {

    const gridCols = 'grid-cols-[minmax(100px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)]'

    return (
        <RelayProvider>
            <table className={`w-full min-w-[420px] h-auto flex flex-col bg-white rounded-[8px] shadow overflow-hidden ${className}`}>
                <thead className="w-full">
                <tr className={`relative grid ${gridCols}`}>
                    {
                        titles.map((value, index) => (
                            <th key={index} className="h-[60px] flex items-center justify-center text-gray-600 select-none font-medium">
                                {value}
                            </th>
                        ))
                    }
                    <th className='w-[calc(100%-2rem)] absolute left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-300'></th>
                </tr>
                </thead>
                <tbody className="w-full">
                <ControllerRow relayType='relay1' />
                <ControllerRow relayType='relay2' />
                <ControllerRow relayType='relay3' />
                <ControllerRow relayType='relay4' />
                </tbody>
            </table>
        </RelayProvider>
    )
}

export default ControllerTable