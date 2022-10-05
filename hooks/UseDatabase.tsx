import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { ExtendedSensorData } from '../model/sensor'
import {
    Day,
    ExportType,
    getMonth,
    indexOfMonth,
    isDay,
    isMonth,
    Month,
    translateExportType,
    Year
} from '../model/date'
import useFirebase from './UseFirebase'
import XLSX, { ColInfo } from 'xlsx'
import { collator } from '../utility/utils'

interface IDatabase {
    years: Array<Year>
    months: Array<Month>
    days: Array<Day>
    selectedYear: Year
    selectedMonth: Month
    selectedDay: Day
    deviceIdList: Array<string>
    data: Array<ExtendedSensorData>
    hasNextPage: boolean
    loading: boolean
    loadingExport: boolean

    setSelectedYear(year: string): void

    setSelectedMonth(month: string): void

    setSelectedDay(day: string): void

    loadData(start: number, end: number): Promise<void>

    exportData(exportType: ExportType, getDeviceName: (deviceId: string) => string): void
}

const DatabaseContext = createContext<IDatabase>({
    years: [],
    months: [],
    days: [],
    selectedYear: 'Semua',
    selectedMonth: 'Semua',
    selectedDay: 'Semua',
    deviceIdList: [],
    data: [],
    hasNextPage: true,
    loading: false,
    loadingExport: false,
    setSelectedYear() {
    },
    setSelectedMonth() {
    },
    setSelectedDay() {
    },
    loadData: () => new Promise<void>(() => {
    }),
    exportData: () => {
    }
})

interface DatabaseProviderProps {
    children: ReactNode
}

export const DatabaseProvider = ({children}: DatabaseProviderProps) => {
    const [years, setYears] = useState<Array<Year>>([])
    const [months, setMonths] = useState<Array<Month>>([])
    const [days, setDays] = useState<Array<Day>>([])
    const [selectedYear, setSelectedYear] = useState<Year>('Semua')
    const [selectedMonth, setSelectedMonth] = useState<Month>('Semua')
    const [selectedDay, setSelectedDay] = useState<Day>('Semua')
    const [deviceIdList, setDeviceIdList] = useState<Array<string>>([])
    const [data, setData] = useState<Array<ExtendedSensorData>>([])
    const [hasNextPage, setHasNextPage] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingExport, setLoadingExport] = useState<boolean>(false)
    const {
        onYearList,
        onDayList,
        onMonthList,
        getData,
        getMonthList,
        getDayList,
        getYearList,
        getExportData
    } = useFirebase()

    useEffect(() => {
        const unsub = onYearList((yearList) => {
            const result = yearList
                .sort(collator.compare)
                .reverse()
            setYears(['Semua', ...result])
            setHasNextPage(true)
        })

        return () => {
            unsub()
        }
    }, [])

    useEffect(() => {
        if (selectedYear !== 'Semua') {
            const unsub = onMonthList(selectedYear, (monthList) => {
                const result = monthList
                    .sort(collator.compare)
                    .reverse()
                    .map(value => getMonth(Number.parseInt(value)))
                    .filter(isMonth)
                setMonths(['Semua', ...result])
                setHasNextPage(true)
            })

            return () => {
                unsub()
            }
        }
    }, [selectedYear])

    useEffect(() => {
        if (selectedMonth !== 'Semua') {
            const unsub = onDayList(selectedYear, indexOfMonth(selectedMonth), (dayList) => {
                const result = dayList.filter(isDay).sort(collator.compare).reverse()
                setDays(['Semua', ...result])
                setHasNextPage(true)
            })

            return () => {
                unsub()
            }
        }
    }, [selectedYear, selectedMonth])

    const setYear = async (year: string) => {
        if (year === selectedYear) {
            return
        }
        if (years.includes(year)) {
            setSelectedYear(year)
            setSelectedMonth('Semua')
            setSelectedDay('Semua')
            setHasNextPage(true)
            setDeviceIdList([])
            setData([])
            await loadMoreData(year, 'Semua', 'Semua')
        }
    }

    const setMonth = async (month: string) => {
        if (month === selectedMonth) {
            return
        }
        if (isMonth(month) && months.includes(month)) {
            setSelectedMonth(month)
            setSelectedDay('Semua')
            setHasNextPage(true)
            setDeviceIdList([])
            setData([])
            await loadMoreData(selectedYear, month, 'Semua')
        }
    }

    const setDay = async (day: string) => {
        if (day === selectedDay) {
            return
        }
        if (isDay(day) && days.includes(day)) {
            setSelectedDay(day)
            setHasNextPage(true)
            setDeviceIdList([])
            setData([])
            await loadMoreData(selectedYear, selectedMonth, day)
        }
    }

    const loadMoreData = (targetYear: Year, targetMonth: Month, targetDay: Day) => {
        setLoading(true)
        return new Promise<void>(async (resolve) => {
            const end = () => {
                setLoading(false)
                resolve()
            }

            const parseDate = (data: ExtendedSensorData | null) => {
                if (!data) {
                    return {year: '', month: '', day: ''}
                }
                const date = new Date(data.dateTime)
                return {
                    year: date.getFullYear().toString(),
                    month: (date.getMonth() + 1).toString().padStart(2, '0'),
                    day: date.getDate().toString().padStart(2, '0')
                }
            }

            const getLastData = () => new Promise<ExtendedSensorData | null>((resolve) => {
                setData((data) => {
                    if (data.length === 0) {
                        resolve(null)
                    } else {
                        resolve(data[data.length - 1])
                    }
                    return data
                })
            })

            const lastDate = parseDate(await getLastData())
            const yearList = (await getYearList()).sort(collator.compare).reverse()

            if (yearList.length === 0) {
                setHasNextPage(false)
                end()
                return
            }

            let monthList: Array<string> = []
            let dayList: Array<string> = []
            let idList: Array<string> = []
            let result: Array<ExtendedSensorData> = []

            let yearIdx = yearList.indexOf(lastDate.year)
            let monthIdx = -1
            let dayIdx = -1

            let year = ''
            let month = ''
            let day = ''

            const fetchMonthList = async () => {
                while (monthList.length === 0) {
                    yearIdx++
                    if (yearIdx >= yearList.length) {
                        setHasNextPage(false)
                        end()
                        return false
                    }
                    year = yearList[yearIdx]
                    monthList = (await getMonthList(year)).sort(collator.compare).reverse()
                }
                return true
            }

            const fetchDayList = async (constraintYear: boolean) => {
                while (dayList.length === 0) {
                    monthIdx++
                    if (monthIdx >= monthList.length) {
                        monthList = []
                        if (constraintYear || !(await fetchMonthList())) {
                            return false
                        }
                        monthIdx = 0
                    }
                    month = monthList[monthIdx]
                    dayList = (await getDayList(year, month)).sort(collator.compare).reverse()
                }
                return true
            }

            const fetchData = async (constraintYear: boolean, constraintMonth: boolean) => {
                while (result.length < 100) {
                    dayIdx++
                    if (dayIdx >= dayList.length) {
                        dayList = []
                        if (constraintMonth || !(await fetchDayList(constraintYear))) {
                            setHasNextPage(false)
                            return
                        }
                        dayIdx = 0
                    }
                    day = dayList[dayIdx]
                    const {ids: id, data} = await getData(`${year}-${month}-${day}`)
                    idList = Array.from(new Set(new Set(idList.concat(id)))).sort(collator.compare)
                    result = [...result, ...data.reverse()]
                }
            }

            if (targetYear === 'Semua') {
                if (yearIdx !== -1) {
                    year = yearList[yearIdx]
                    monthList = (await getMonthList(year)).sort(collator.compare).reverse()
                    monthIdx = monthList.indexOf(lastDate.month)
                }

                if (!(await fetchMonthList())) {
                    return
                }

                if (monthIdx !== -1) {
                    month = monthList[monthIdx]
                    dayList = (await getDayList(year, month)).sort(collator.compare).reverse()
                    dayIdx = dayList.indexOf(lastDate.day)
                }

                if (!(await fetchDayList(false))) {
                    return
                }

                await fetchData(false, false)
                setDeviceIdList(ids => Array.from(new Set(new Set(idList.concat(ids)))).sort(collator.compare))
                setData((data) => [...data, ...result])
                end()
                return
            }

            yearIdx = yearList.indexOf(targetYear)
            if (yearIdx === -1) {
                setHasNextPage(false)
                end()
                return
            }
            year = yearList[yearIdx]
            monthList = (await getMonthList(year)).sort(collator.compare).reverse()

            if (targetMonth === 'Semua') {
                monthIdx = monthList.indexOf(lastDate.month)
                if (monthIdx !== -1) {
                    month = monthList[monthIdx]
                    dayList = (await getDayList(year, month)).sort(collator.compare).reverse()
                    dayIdx = dayList.indexOf(lastDate.day)
                }

                if (!(await fetchDayList(true))) {
                    return
                }

                await fetchData(true, false)
                setDeviceIdList(ids => Array.from(new Set(new Set(idList.concat(ids)))).sort(collator.compare))
                setData((data) => [...data, ...result])
                end()
                return
            }

            monthIdx = monthList.indexOf(indexOfMonth(targetMonth))
            if (monthIdx === -1) {
                setHasNextPage(false)
                end()
                return
            }
            month = monthList[monthIdx]
            dayList = (await getDayList(year, month)).sort(collator.compare).reverse()

            if (targetDay === 'Semua') {
                dayIdx = dayList.indexOf(lastDate.day)
                await fetchData(true, true)
                setDeviceIdList(ids => Array.from(new Set(new Set(idList.concat(ids)))).sort(collator.compare))
                setData((data) => [...data, ...result])
                end()
                return
            }

            dayIdx = dayList.indexOf(targetDay)
            if (dayIdx === -1) {
                setHasNextPage(false)
                end()
                return
            }
            day = dayList[dayIdx]
            const {ids: id, data} = await getData(`${year}-${month}-${day}`)
            idList = id
            result = data

            if (result.length === 0) {
                setHasNextPage(false)
                end()
                return
            }

            setDeviceIdList(ids => Array.from(new Set(new Set(idList.concat(ids)))).sort(collator.compare))
            setData((data) => [...data, ...result])
            setHasNextPage(false)
            end()
        })
    }

    const exportData = async (exportType: ExportType, getDeviceName: (deviceId: string) => string) => {
        setLoadingExport(true)
        const {ids, data} = await getExportData(exportType, selectedYear, selectedMonth, selectedDay)
        const idList = ids.sort(collator.compare)

        const padStart = (n: number) => {
            return n.toString().padStart(2, '0')
        }

        const getTimeHeader = () => {
            switch (exportType) {
                case 'yearly':
                    return 'Tahun'
                case 'monthly':
                    return 'Bulan'
                case 'daily':
                    return 'Tanggal'
                case 'hourly':
                    return selectedDay === 'Semua' ? 'Tanggal/Waktu' : 'Waktu'
                default:
                    return 'Waktu'
            }
        }

        const formatDate = (dateTime: string) => {
            const date = new Date(dateTime)
            switch (exportType) {
                case 'yearly':
                    return date.getFullYear().toString()
                case 'monthly':
                    return selectedYear === 'Semua' ? `${date.getFullYear()}-${padStart(date.getMonth() + 1)}` : `${getMonth(date.getMonth() + 1)}`
                case 'daily':
                    return `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())}`
                case 'hourly':
                    return selectedDay === 'Semua'
                        ? `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())}, ${padStart(date.getHours())}:00`
                        : `${padStart(date.getHours())}:00`
                default:
                    return `${padStart(date.getHours())}:${padStart(date.getMinutes())}`
            }
        }

        const getFileNameDate = () => {
            if (selectedYear === 'Semua') {
                return 'Semua'
            }
            if (selectedMonth === 'Semua') {
                return selectedYear
            }
            if (selectedDay === 'Semua') {
                return `${selectedYear}_${indexOfMonth(selectedMonth)}`
            }
            return `${selectedYear}_${indexOfMonth(selectedMonth)}_${selectedDay}`
        }

        const titles: Array<string> = [getTimeHeader(), ...idList.map(id => getDeviceName(id)), 'Total']
        const cellWidths: Array<ColInfo> = []
        const workbook = XLSX.utils.book_new()
        const sheetName = `Data ${translateExportType(exportType)}`
        const fileName = `Data Monitoring Listrik - ${getFileNameDate()} - ${translateExportType(exportType)}.xlsx`
        const worksheet = XLSX.utils.aoa_to_sheet([titles])

        for (const title of titles) {
            cellWidths.push({wch: title.length})
        }

        for (let i = 0; i < data.length; i++) {
            const sensor = data[i]
            const formattedDate = formatDate(sensor.dateTime)
            const buffer: Array<any> = [formattedDate]

            if (formattedDate.length > (cellWidths[0].wch ?? 0)) {
                cellWidths[0].wch = formattedDate.length
            }

            for (let j = 0; j < idList.length; j++) {
                const key = idList[j]
                const value = sensor.data[key]?.energy ?? 0
                buffer.push(value)
                if (value.toString().length > (cellWidths[j + 1].wch ?? 0)) {
                    cellWidths[j + 1].wch = value.toString().length
                }
            }

            buffer.push(sensor.total.energy)
            if (sensor.total.energy.toString().length > (cellWidths[cellWidths.length - 1].wch ?? 0)) {
                cellWidths[cellWidths.length - 1].wch = sensor.total.energy.toString().length
            }
            XLSX.utils.sheet_add_aoa(worksheet, [buffer], {origin: {r: i + 1, c: 0}})
        }

        for (const width of cellWidths) {
            width.wch = (width.wch ?? 0) + 4
        }

        worksheet['!cols'] = cellWidths
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
        XLSX.writeFileXLSX(workbook, fileName)
        setLoadingExport(false)
    }

    return (
        <DatabaseContext.Provider value={{
            years,
            months,
            days,
            selectedYear,
            selectedMonth,
            selectedDay,
            deviceIdList,
            data,
            hasNextPage,
            loading,
            loadingExport,
            setSelectedYear: setYear,
            setSelectedMonth: setMonth,
            setSelectedDay: setDay,
            loadData: () => loadMoreData(selectedYear, selectedMonth, selectedDay),
            exportData
        }}>
            {children}
        </DatabaseContext.Provider>
    )
}

export default function useDatabase() {
    return useContext(DatabaseContext)
}