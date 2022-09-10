import DropDown from '../DropDown'
import useDatabase from '../../hooks/UseDatabase'
import useFirebase from '../../hooks/UseFirebase'

interface Props {
    className?: string
}

const DatabaseFilter = ({className}: Props) => {
    const {connected} = useFirebase()
    const {
        years,
        months,
        days,
        selectedYear,
        selectedMonth,
        selectedDay,
        setSelectedYear,
        setSelectedMonth,
        setSelectedDay
    } = useDatabase()

    return (
        <div className={`shrink-0 mx-8 flex gap-4 ${className}`}>
            <DropDown
                className="w-[100px]"
                label="Tahun"
                selected={selectedYear}
                onItemSelected={(item) => {
                    setSelectedYear(item)
                }}
                disabled={!connected}
                items={years}/>
            <DropDown
                className="w-[120px]"
                label="Bulan"
                selected={selectedMonth}
                disabled={!connected || selectedYear === 'Semua'}
                onItemSelected={(item) => {
                    setSelectedMonth(item)
                }}
                items={months}/>
            <DropDown
                className="w-[100px]"
                label="Tanggal"
                selected={selectedDay}
                disabled={!connected || selectedMonth === 'Semua'}
                onItemSelected={(item) => {
                    setSelectedDay(item)
                }}
                items={days}/>
        </div>
    )
}

export default DatabaseFilter