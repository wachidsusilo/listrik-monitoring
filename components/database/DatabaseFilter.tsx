import DropDown from '../DropDown'
import useDatabase from '../../hooks/UseDatabase'
import useFirebase from '../../hooks/UseFirebase'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { ExportType, getExportTypeList, toExportType } from '../../model/date'
import useDevice from '../../hooks/UseDevice'

interface Props {
    className?: string
}

const DatabaseFilter = ({className}: Props) => {
    const {connected} = useFirebase()
    const {getDeviceName} = useDevice()
    const {
        years,
        months,
        days,
        selectedYear,
        selectedMonth,
        selectedDay,
        data,
        loadingExport,
        exportData,
        setSelectedYear,
        setSelectedMonth,
        setSelectedDay
    } = useDatabase()

    const getExportTypeFrom = (): ExportType => {
        if (selectedYear === 'Semua') {
            return 'yearly'
        }
        if (selectedMonth === 'Semua') {
            return 'monthly'
        }
        if (selectedDay === 'Semua') {
            return 'daily'
        }
        return 'hourly'
    }

    const getExportTypeTo = (): ExportType => {
        if (selectedYear === 'Semua' || selectedMonth === 'Semua') {
            return 'daily'
        }
        if (selectedDay === 'Semua') {
            return 'hourly'
        }
        return 'minutely'
    }

    return (
        <div className={`mx-8 flex flex-wrap gap-4 ${className}`}>
            <DropDown
                className="w-[100px] z-30"
                label="Tahun"
                selected={selectedYear}
                onItemSelected={(item) => {
                    setSelectedYear(item)
                }}
                disabled={!connected}
                items={years}/>
            <DropDown
                className="w-[120px] z-20"
                label="Bulan"
                selected={selectedMonth}
                disabled={!connected || selectedYear === 'Semua'}
                onItemSelected={(item) => {
                    setSelectedMonth(item)
                }}
                items={months}/>
            <DropDown
                className="w-[100px] z-10"
                label="Tanggal"
                selected={selectedDay}
                disabled={!connected || selectedMonth === 'Semua'}
                onItemSelected={(item) => {
                    setSelectedDay(item)
                }}
                items={days}/>
            <DropDown
                className="w-[120px] z-10 self-end"
                placeholder="Export"
                loading={loadingExport}
                placeholderOnly={true}
                disabled={!connected}
                icon={<ArrowDownTrayIcon className='w-4 h-4 text-gray-600' />}
                colorClass="text-white"
                bgColorClass="bg-green-500"
                onItemSelected={(item) => {
                    if (!loadingExport) {
                        exportData(toExportType(item), getDeviceName)
                    }
                }}
                items={getExportTypeList(getExportTypeFrom(), getExportTypeTo())}/>
        </div>
    )
}

export default DatabaseFilter