import ControllerRow from './ControllerRow'
import { collator } from '../../utility/utils'
import useDevice from '../../hooks/UseDevice'

interface Props {
    className?: string
}

const titles = ['ID', 'Nama', 'Aktif', 'Kondisi', 'Waktu ON', 'Waktu OFF', 'Auto', 'OFF/ON']

const ControllerTable = ({className = ''}: Props) => {
    const {deviceData} = useDevice()

    const gridCols = 'grid-cols-[minmax(100px,1fr)_minmax(120px,1fr)_minmax(150px,1fr)_minmax(100px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)]'

    return (
        <table
            className={`min-w-[910px] h-auto flex flex-col bg-white rounded-[8px] shadow ${className}`}>
            <thead className="w-full">
            <tr className={`relative grid ${gridCols}`}>
                {
                    titles.map((value, index) => (
                        <th key={index}
                            className="h-[60px] flex items-center justify-center text-gray-600 select-none font-medium">
                            {value}
                        </th>
                    ))
                }
                <th className="w-[calc(100%-2rem)] absolute left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-300"></th>
            </tr>
            </thead>
            <tbody className="w-full">
            {
                Object.keys(deviceData).sort(collator.compare).map((value, index) => (
                    <ControllerRow key={index} deviceId={value} />
                ))
            }
            </tbody>
        </table>
    )
}

export default ControllerTable