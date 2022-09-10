import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { ExtendedSensorValueData } from '../model/sensor'
import { Day, getMonth, indexOfMonth, isDay, isMonth, Month, Year } from '../model/date'
import useFirebase from './UseFirebase'

interface IDatabase {
    years: Array<Year>
    months: Array<Month>
    days: Array<Day>
    selectedYear: Year
    selectedMonth: Month
    selectedDay: Day
    data: Array<ExtendedSensorValueData>
    hasNextPage: boolean
    loading: boolean
    setSelectedYear(year: string): void
    setSelectedMonth(month: string): void
    setSelectedDay(day: string): void
    loadData(start: number, end: number): Promise<void>
}

const DatabaseContext = createContext<IDatabase>({
    years: [],
    months: [],
    days: [],
    selectedYear: 'Semua',
    selectedMonth: 'Semua',
    selectedDay: 'Semua',
    data: [],
    hasNextPage: true,
    loading: false,
    setSelectedYear() {},
    setSelectedMonth() {},
    setSelectedDay() {},
    loadData: () => new Promise<void>(() => {})
})

interface DatabaseProviderProps {
    children: ReactNode
}

const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})

export const DatabaseProvider = ({children}: DatabaseProviderProps) => {
    const [years, setYears] = useState<Array<Year>>([])
    const [months, setMonths] = useState<Array<Month>>([])
    const [days, setDays] = useState<Array<Day>>([])
    const [selectedYear, setSelectedYear] = useState<Year>('Semua')
    const [selectedMonth, setSelectedMonth] = useState<Month>('Semua')
    const [selectedDay, setSelectedDay] = useState<Day>('Semua')
    const [data, setData] = useState<Array<ExtendedSensorValueData>>([])
    const [hasNextPage, setHasNextPage] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(false)
    const {onYearList, onDayList, onMonthList, getData, getMonthList, getDayList, getYearList} = useFirebase()

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

    const setYear = useCallback((year: string) => {
        if (years.includes(year)) {
            setSelectedYear(year)
            setSelectedMonth('Semua')
            setSelectedDay('Semua')
            setLoading(false)
            setHasNextPage(true)
            setData([])
        }
    }, [years])

    const setMonth = useCallback((month: string) => {
        if (isMonth(month) && months.includes(month)) {
            setSelectedMonth(month)
            setSelectedDay('Semua')
            setLoading(false)
            setHasNextPage(true)
            setData([])
        }
    }, [months])

    const setDay = useCallback((day: string) => {
        if (isDay(day) && days.includes(day)) {
            setSelectedDay(day)
        }
        setLoading(false)
        setHasNextPage(true)
        setData([])
    }, [days])

    const loadData = useCallback(() => {
        console.log('re-fetching data')
        setLoading(true)
        return new Promise<void>(async (resolve) => {
            const end = () => {
                setLoading(false)
                resolve()
            }

            const parseDate = (data: ExtendedSensorValueData | null) => {
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

            const getLastData = () => new Promise<ExtendedSensorValueData|null>((resolve) => {
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
            let result: Array<ExtendedSensorValueData> = []

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
                            return false
                        }
                        dayIdx = 0
                    }
                    day = dayList[dayIdx]
                    result = [...result, ...(await getData(`${year}-${month}-${day}`)).reverse()]
                }
                return true
            }

            if (selectedYear === 'Semua') {
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

                if (!(await fetchData(false, false))) {
                    return
                }

                setData((data) => [...data, ...result])
                end()
                return
            }

            yearIdx = yearList.indexOf(selectedYear)
            if (yearIdx === -1) {
                setHasNextPage(false)
                end()
                return
            }
            year = yearList[yearIdx]
            monthList = (await getMonthList(year)).sort(collator.compare).reverse()

            if (selectedMonth === 'Semua') {
                monthIdx = monthList.indexOf(lastDate.month)
                if (monthIdx !== -1) {
                    month = monthList[monthIdx]
                    dayList = (await getDayList(year, month)).sort(collator.compare).reverse()
                    dayIdx = dayList.indexOf(lastDate.day)
                }

                if (!(await fetchDayList(true))) {
                    return
                }

                if (!(await fetchData(true, false))) {
                    return
                }

                setData((data) => [...data, ...result])
                end()
                return
            }

            monthIdx = monthList.indexOf(indexOfMonth(selectedMonth))
            if (monthIdx === -1) {
                setHasNextPage(false)
                end()
                return
            }
            month = monthList[monthIdx]
            dayList = (await getDayList(year, month)).sort(collator.compare).reverse()

            if (selectedDay === 'Semua') {
                dayIdx = dayList.indexOf(lastDate.day)
                if (!(await fetchData(true, true))) {
                    return
                }

                setData((data) => [...data, ...result])
                end()
                return
            }

            dayIdx = dayList.indexOf(selectedDay)
            if (dayIdx === -1) {
                setHasNextPage(false)
                end()
                return
            }
            day = dayList[dayIdx]
            result = await getData(`${year}-${month}-${day}`)

            if (result.length === 0) {
                setHasNextPage(false)
                end()
                return
            }

            setData((data) => [...data, ...result])
            setHasNextPage(false)
            end()
        })
    }, [selectedYear, selectedMonth, selectedDay])

    return (
        <DatabaseContext.Provider value={{
            years,
            months,
            days,
            selectedYear,
            selectedMonth,
            selectedDay,
            data,
            hasNextPage,
            loading,
            setSelectedYear: setYear,
            setSelectedMonth: setMonth,
            setSelectedDay: setDay,
            loadData
        }}>
            {children}
        </DatabaseContext.Provider>
    )
}

export default function useDatabase() {
    return useContext(DatabaseContext)
}