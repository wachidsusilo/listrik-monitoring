import { initializeApp } from 'firebase/app'
import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as logOut } from 'firebase/auth'
import { getDatabase, onValue, ref, set, get, query, orderByKey, limitToLast, startAt, endAt } from 'firebase/database'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import {
    SensorData,
    ExtendedSensorData,
    isSensorData,
    SensorTotalData,
    Sensor, isSensor
} from '../model/sensor'
import { RelayData, isRelayData, Relay } from '../model/relay'
import { v4 as UUID } from 'uuid'
import { Device, DeviceData, isDevice } from '../model/device'
import { collator, formatTime, isObject } from '../utility/utils'
import { Day, ExportType, indexOfMonth, Month, PeriodType, Year } from '../model/date'

const firebaseConfig = {
    apiKey: 'AIzaSyCHk8ju9w81TU43B7xdVqvqODXyEzD_Ln8',
    authDomain: 'listrik-monitoring.firebaseapp.com',
    databaseURL: 'https://listrik-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'listrik-monitoring',
    storageBucket: 'listrik-monitoring.appspot.com',
    messagingSenderId: '893714410798',
    appId: '1:893714410798:web:e693f028bea97848f39ebf',
    measurementId: 'G-CKJSGJSP1L'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)

let isInitialized = false
type Unsubscribe = () => void

interface AuthCallback {
    id: string

    call(user: User | null): void
}

interface SensorCallback {
    id: string

    call(sensor: SensorData): void
}

interface RelayCallback {
    id: string

    call(relay: RelayData): void
}

interface DeviceCallback {
    id: string

    call(lastOnline: number, lastUpdate: number, data: DeviceData): void
}

const authCallbacks: Array<AuthCallback> = []
const sensorCallbacks: Array<SensorCallback> = []
const relayCallbacks: Array<RelayCallback> = []
const deviceCallbacks: Array<DeviceCallback> = []

const signIn = (email: string, password: string) => new Promise<User | null>((resolve, reject) => {
    signInWithEmailAndPassword(auth, email, password)
        .then((credential) => {
            resolve(credential.user)
        })
        .catch((reason) => {
            reject(reason)
        })
})

const signOut = () => new Promise<void>((resolve, reject) => {
    logOut(auth)
        .then(() => {
            resolve()
        })
        .catch((reason) => {
            reject(reason)
        })
})

const onAuthChanged = (call: (user: User | null) => void) => {
    const id = UUID()
    authCallbacks.push({id, call})
    if (isInitialized) {
        call(auth.currentUser)
    }
    return function () {
        const idx = authCallbacks.findIndex(value => value.id === id)
        if (idx >= 0) {
            authCallbacks.splice(idx, 1)
        }
    }
}

const onValueSensor = (call: (sensor: SensorData) => void) => {
    const id = UUID()
    sensorCallbacks.push({id, call})
    get(ref(db, 'sensor'))
        .then((value) => {
            const data = value.val()
            if (isSensorData(data)) {
                call(data)
            }
        })
        .catch(e => console.log(e?.message))
    return function () {
        const idx = sensorCallbacks.findIndex(value => value.id === id)
        if (idx >= 0) {
            sensorCallbacks.splice(idx, 1)
        }
    }
}

const onValueRelay = (call: (relay: RelayData) => void) => {
    const id = UUID()
    relayCallbacks.push({id, call})
    if (auth.currentUser) {
        get(ref(db, 'relay'))
            .then((value) => {
                const data = value.val()
                if (isRelayData(data)) {
                    call(data)
                }
            })
            .catch(e => console.log(e?.message))
    }
    return function () {
        const idx = relayCallbacks.findIndex(value => value.id === id)
        if (idx >= 0) {
            relayCallbacks.splice(idx, 1)
        }
    }
}

const onValueDevice = (call: (lastOnline: number, lastUpdate: number, data: DeviceData) => void) => {
    const id = UUID()
    deviceCallbacks.push({id, call})
    if (auth.currentUser) {
        get(ref(db, 'device'))
            .then((value) => {
                const data = value.val()
                const devices = Object.keys(data)
                    .filter(key => isDevice(data[key]))
                    .reduce<DeviceData>((acc, key) => {
                        acc[key] = data[key]
                        return acc
                    }, {})

                if (isDevice(data)) {
                    call(data.lastOnline ?? 0, data.lastUpdate ?? 0, devices)
                }
            })
            .catch(e => console.log(e?.message))
    }
    return function () {
        const idx = deviceCallbacks.findIndex(value => value.id === id)
        if (idx >= 0) {
            deviceCallbacks.splice(idx, 1)
        }
    }
}

const setRelay = (deviceId: string, field: keyof Relay, value: string | number | boolean) => {
    if (auth.currentUser) {
        set(ref(db, `relay/${deviceId}/${field}`), value).then()
    }
}

const setDevice = (deviceId: string, field: keyof Device, value: string | number) => {
    if (auth.currentUser) {
        set(ref(db, `device/${deviceId}/${field}`), value).then()
    }
}

const getYearList = () => new Promise<Array<string>>((resolve) => {
    get(ref(db, 'metadata'))
        .then((snapshot) => {
            const data = snapshot.val()
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                resolve(Object.keys(data).filter(value => !isNaN(Number.parseInt(value))))
            } else {
                resolve([])
            }
        })
})

const getMonthList = (year: string) => new Promise<Array<string>>((resolve) => {
    get(ref(db, `metadata/${year}`))
        .then((snapshot) => {
            const data = snapshot.val()
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                resolve(Object.keys(data).filter(value => !isNaN(Number.parseInt(value))))
            } else {
                resolve([])
            }
        })
})

const getDayList = (year: string, month: string) => new Promise<Array<string>>((resolve) => {
    get(ref(db, `metadata/${year}/${month}`))
        .then((snapshot) => {
            const data = snapshot.val()
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                resolve(Object.keys(data).filter(value => !isNaN(Number.parseInt(value))))
            } else {
                resolve([])
            }
        })
})

const onYearList = (call: (yearList: Array<string>) => void) => {
    return onValue(ref(db, 'metadata'), (snapshot) => {
        const data = snapshot.val()
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            call(Object.keys(data).filter(value => !isNaN(Number.parseInt(value))))
        } else {
            call([])
        }
    })
}

const onMonthList = (year: string, call: (monthList: Array<string>) => void) => {
    return onValue(ref(db, `metadata/${year}`), (snapshot) => {
        const data = snapshot.val()
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            call(Object.keys(data).filter(value => !isNaN(Number.parseInt(value))))
        } else {
            call([])
        }
    })
}

const onDayList = (year: string, month: string, call: (dayList: Array<string>) => void) => {
    return onValue(ref(db, `metadata/${year}/${month}`), (snapshot) => {
        const data = snapshot.val()
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            call(Object.keys(data).filter(value => !isNaN(Number.parseInt(value))))
        } else {
            call([])
        }
    })
}

const getData = async (dateString: string, lastDataOnly: boolean = false): Promise<{ ids: Array<string>, data: Array<ExtendedSensorData> }> => {
    const date = new Date(dateString)
    if (isNaN(date.getDate())) {
        return {ids: [], data: []}
    }

    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = (date.getDate()).toString().padStart(2, '0')

    let data: any
    if (lastDataOnly) {
        data = (await get(query(ref(db, `data/${year}/${month}/${day}`), orderByKey(), limitToLast(1)))).val()
    } else {
        data = (await get(query(ref(db, `data/${year}/${month}/${day}`), orderByKey()))).val()
    }
    if (!isObject(data)) {
        return {ids: [], data: []}
    }

    const ids: Array<string> = []
    const sensorData: Array<ExtendedSensorData> = Object.keys(data).sort(collator.compare)
        .filter(key => isSensorData(data[key]))
        .map(key => {
            const total = Object.keys(data[key])
                .reduce<Sensor>((prev, current) => {
                    if (isSensor(data[key][current])) {
                        prev.power += data[key][current].power
                        prev.energy += data[key][current].energy
                        if (!ids.includes(current)) {
                            ids.push(current)
                        }
                    }
                    return prev
                }, {
                    power: 0,
                    energy: 0
                })

            return {
                dateTime: `${year}-${month}-${day}T${formatTime(Number.parseInt(key))}`,
                total,
                data: data[key]
            }
        })
    return {ids, data: sensorData}
}

const getDataOfPeriod = async (periodType: PeriodType): Promise<Array<SensorTotalData>> => {
    const date = new Date()

    const fetchDataOfTheDay = async (year: string, month: string, day: string, lastDataOnly: boolean = false): Promise<Array<SensorTotalData> | null> => {
        let sensorData: any

        if (lastDataOnly) {
            sensorData = (await get(query(ref(db, `data/${year}/${month}/${day}`), orderByKey(), limitToLast(1)))).val()
        } else {
            sensorData = (await get(query(ref(db, `data/${year}/${month}/${day}`)))).val()
        }

        if (!isObject(sensorData)) {
            return null
        }

        return Object.keys(sensorData)
            .filter(value => isSensorData(sensorData[value]))
            .sort(collator.compare)
            .map(key => {
                const svd = sensorData[key] as SensorData
                return {
                    dateTime: `${year}-${month}-${day}T${formatTime(Number.parseInt(key))}`,
                    total: Object.values(svd)
                        .reduce<Sensor>((prev, current) => {
                            if (isSensor(current)) {
                                prev.power += current.power
                                prev.energy += current.energy
                            }
                            return prev
                        }, {
                            power: 0,
                            energy: 0
                        })
                }
            })
    }

    const fetchDataPerDay = async (year: string, month: string, dayList: any): Promise<Array<SensorTotalData>> => {
        if (!isObject(dayList)) {
            return []
        }

        const dataPerDay: Array<SensorTotalData> = []
        const days = Object.keys(dayList).sort(collator.compare)
        for (const day of days) {
            const result = await fetchDataOfTheDay(year, month, day, true)
            if (result && result.length > 0) {
                dataPerDay.push(result[0])
            }
        }
        return dataPerDay
    }

    const fetchDataOfTheYear = async (year: string): Promise<Array<SensorTotalData>> => {
        const monthList = (await get(query(ref(db, `metadata/${year}`)))).val()
        if (!isObject(monthList)) {
            return []
        }

        const dataOfTheYear: Array<SensorTotalData> = []
        const months = Object.keys(monthList).sort(collator.compare)
        for (const month of months) {
            const dayList = monthList[month]
            const dataOfTheMonth = (await fetchDataPerDay(year, month, dayList))
                .reduce<SensorTotalData>((acc, data) => {
                    acc.dateTime = data.dateTime
                    acc.total.power += data.total.power
                    acc.total.energy += data.total.energy
                    return acc
                }, {
                    dateTime: ``,
                    total: {
                        power: 0,
                        energy: 0
                    }
                })
            dataOfTheYear.push(dataOfTheMonth)
        }
        return dataOfTheYear
    }

    if (periodType === 'today' || periodType === 'yesterday') {
        if (periodType === 'yesterday') {
            date.setDate(date.getDate() - 1)
        }

        const year = date.getFullYear().toString().padStart(4, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')

        return await fetchDataOfTheDay(year, month, day) ?? []
    }

    if (periodType === 'this-week' || periodType === 'this-month') {
        const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0')
        const currentDay = date.getDate().toString().padStart(2, '0')

        if (periodType === 'this-week') {
            date.setDate(date.getDate() - date.getDay())
        }

        const year = date.getFullYear().toString().padStart(4, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const startDay = date.getDate().toString().padStart(2, '0')

        let result: Array<SensorTotalData>

        if (periodType === 'this-week') {
            if (currentMonth === month) {
                const dayList = (await get(query(ref(db, `metadata/${year}/${month}`), orderByKey(), startAt(startDay)))).val()
                result = await fetchDataPerDay(year, month, dayList)
            } else {
                const dayListOfPrevMonth = (await get(query(ref(db, `metadata/${year}/${month}`), orderByKey(), startAt(startDay)))).val()
                const dayListOfCurrentMonth = (await get(query(ref(db, `metadata/${year}/${currentMonth}`), orderByKey(), endAt(currentDay)))).val()
                result = [
                    ...(await fetchDataPerDay(year, month, dayListOfPrevMonth)),
                    ...(await fetchDataPerDay(year, currentMonth, dayListOfCurrentMonth))
                ]
            }
        } else {
            const dayList = (await get(query(ref(db, `metadata/${year}/${month}`)))).val()
            result = await fetchDataPerDay(year, month, dayList)
        }

        return result
    }

    if (periodType === 'this-year') {
        const year = date.getFullYear().toString().padStart(4, '0')
        return await fetchDataOfTheYear(year)
    }

    const yearList = (await get(query(ref(db, `metadata`)))).val()
    if (!isObject(yearList)) {
        return []
    }

    const allData: Array<SensorTotalData> = []
    const years = Object.keys(yearList).sort(collator.compare)
    for (const year of years) {
        allData.push(...(await fetchDataOfTheYear(year)))
    }
    return allData
}

const getExportData = async (exportType: ExportType, targetYear: Year, targetMonth: Month, targetDay: Day): Promise<{ ids: Array<string>, data: Array<ExtendedSensorData> }> => {
    const yearList = (await getYearList()).sort(collator.compare)
    let idList: Array<string> = []

    const reduce = (buffer: Array<ExtendedSensorData>): ExtendedSensorData | null => {
        if (buffer.length === 0) {
            return null
        }

        return buffer.reduce<ExtendedSensorData>((acc, current) => {
            acc.dateTime = current.dateTime
            acc.total.power += current.total.power
            acc.total.energy += current.total.energy
            for (const key of Object.keys(current.data)) {
                if (acc.data[key]) {
                    acc.data[key].power += current.data[key].power
                    acc.data[key].energy += current.data[key].energy
                } else {
                    acc.data[key] = current.data[key]
                }
            }
            return acc
        }, {
            dateTime: '',
            total: {power: 0, energy: 0},
            data: {}
        })
    }

    const fetchDataOfTheMonth = async (year: string, month: string): Promise<ExtendedSensorData|null> => {
        const dayList = await getDayList(year, month)
        const buffer: Array<ExtendedSensorData> = []
        for (const day of dayList) {
            const {ids, data} = await getData(`${year}-${month}-${day}`, true)
            idList = Array.from(new Set(idList.concat(ids))).sort(collator.compare)
            buffer.push(...data)
        }
        return reduce(buffer)
    }

    const fetchDataOfTheYear = async (year: string): Promise<ExtendedSensorData|null> => {
        const monthList = await getMonthList(year)
        const buffer: Array<ExtendedSensorData> = []
        for (const month of monthList) {
            const data = await fetchDataOfTheMonth(year, month)
            if (data) {
                buffer.push(data)
            }
        }
        return reduce(buffer)
    }

    const fetchDataPerHour = async (year: string, month: string, day: string): Promise<Array<ExtendedSensorData>> => {
        const {ids, data} = await getData(`${year}-${month}-${day}`)
        idList = Array.from(new Set(idList.concat(ids))).sort(collator.compare)
        const buffer: {[key: string]: ExtendedSensorData} = {}
        for (const current of data) {
            const date = new Date(current.dateTime)
            const hour = date.getHours().toString().padStart(2, '0')
            if (!buffer[hour]) {
                buffer[hour] = current
            }
        }
        return Object.keys(buffer).sort(collator.compare).map(key => buffer[key])
    }

    const fetchDataPerDay = async (year: string, month: string): Promise<Array<ExtendedSensorData>> => {
        const data: Array<ExtendedSensorData> = []
        const dayList = await getDayList(year, month)
        for (const day of dayList) {
            const {ids, data: res} = await getData(`${year}-${month}-${day}`, true)
            idList = Array.from(new Set(idList.concat(ids))).sort(collator.compare)
            data.push(...res)
        }
        return data
    }

    const fetchDataPerMonth = async (year: string): Promise<Array<ExtendedSensorData>> => {
        const data: Array<ExtendedSensorData> = []
        const monthList = await getMonthList(year)
        for (const month of monthList) {
            const res = await fetchDataOfTheMonth(year, month)
            if (res) {
                data.push(res)
            }
        }
        return data
    }

    if (targetYear === 'Semua') {
        if (exportType === 'yearly') {
            const data: Array<ExtendedSensorData> = []
            for (const year of yearList) {
                const res = await fetchDataOfTheYear(year)
                if (res) {
                    data.push(res)
                }
            }
            return {ids: idList, data}
        }

        if (exportType === 'monthly') {
            const data: Array<ExtendedSensorData> = []
            for (const year of yearList) {
                data.push(...(await fetchDataPerMonth(year)))
            }
            return {ids: idList, data}
        }

        if (exportType === 'daily') {
            const data: Array<ExtendedSensorData> = []
            for (const year of yearList) {
                const monthList = await getMonthList(year)
                for (const month of monthList) {
                    data.push(...(await fetchDataPerDay(year, month)))
                }
            }
            return {ids: idList, data}
        }

        return {ids: [], data: []}
    }

    if (targetMonth === 'Semua') {
        if (!yearList.includes(targetYear)) {
            return {ids: [], data: []}
        }

        if (exportType === 'monthly') {
            const data = await fetchDataPerMonth(targetYear)
            return {ids: idList, data}
        }

        if (exportType === 'daily') {
            const monthList = await getMonthList(targetYear)
            const data: Array<ExtendedSensorData> = []
            for (const month of monthList) {
                const res = await fetchDataPerDay(targetYear, month)
                data.push(...res)
            }
            return {ids: idList, data}
        }

        return {ids: [], data: []}
    }

    if (targetDay === 'Semua') {
        if (!yearList.includes(targetYear) ) {
            return {ids: [], data: []}
        }

        const month = indexOfMonth(targetMonth)
        if (!(await getMonthList(targetYear)).includes(month)) {
            return {ids: [], data: []}
        }

        if (exportType === 'daily') {
            const data = await fetchDataPerDay(targetYear, month)
            return {ids: idList, data}
        }

        if (exportType === 'hourly') {
            const dayList = await getDayList(targetYear, month)
            const data: Array<ExtendedSensorData> = []
            for (const day of dayList) {
                const res = await fetchDataPerHour(targetYear, month, day)
                data.push(...res)
            }
            return {ids: idList, data}
        }

        return {ids: [], data: []}
    }

    if (!yearList.includes(targetYear) ) {
        return {ids: [], data: []}
    }

    const month = indexOfMonth(targetMonth)
    if (!(await getMonthList(targetYear)).includes(month)) {
        return {ids: [], data: []}
    }

    if (!(await getDayList(targetYear, month)).includes(targetDay)) {
        return {ids: [], data: []}
    }

    if (exportType === 'hourly') {
        const data = await fetchDataPerHour(targetYear, month, targetDay)
        return {ids: idList, data}
    }

    if (exportType === 'minutely') {
        return await getData(`${targetYear}-${month}-${targetDay}`, false)
    }

    return {ids: [], data: []}
}

interface IFirebase {
    connected: boolean

    signIn(email: string, password: string): Promise<User | null>

    signOut(): Promise<void>

    onAuthChanged(call: (user: User | null) => void): Unsubscribe

    onValueSensor(call: (sensor: SensorData) => void): Unsubscribe

    onValueRelay(call: (relay: RelayData) => void): Unsubscribe

    onValueDevice(call: (lastOnline: number, lastUpdate: number, data: DeviceData) => void): Unsubscribe

    setRelay(relayId: string, field: keyof Relay, value: string | number | boolean): void

    setDevice(deviceId: string, field: keyof Device, value: string | number): void

    getYearList(): Promise<Array<string>>

    getMonthList(year: string): Promise<Array<string>>

    getDayList(year: string, month: string): Promise<Array<string>>

    onYearList(call: (yearList: Array<string>) => void): Unsubscribe

    onMonthList(year: string, call: (monthList: Array<string>) => void): Unsubscribe

    onDayList(year: string, month: string, call: (dayList: Array<string>) => void): Unsubscribe

    getData(dateString: string, lastDataOnly?: boolean): Promise<{ ids: Array<string>, data: Array<ExtendedSensorData> }>

    getDataOfPeriod(periodType: PeriodType): Promise<Array<SensorTotalData>>

    getExportData(exportType: ExportType, year: Year, month: Month, day: Day): Promise<{ ids: Array<string>, data: Array<ExtendedSensorData> }>
}

const FirebaseContext = createContext<IFirebase>({
    connected: false,
    signIn,
    signOut,
    onAuthChanged,
    onValueSensor,
    onValueRelay,
    onValueDevice,
    setRelay,
    setDevice,
    getYearList,
    getMonthList,
    getDayList,
    onYearList,
    onMonthList,
    onDayList,
    getData,
    getDataOfPeriod,
    getExportData
})

interface FirebaseProviderProps {
    children: ReactNode
}

export const FirebaseProvider = ({children}: FirebaseProviderProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [connected, setConnected] = useState<boolean>(false)

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            isInitialized = true
            for (const callback of authCallbacks) {
                callback.call(user)
            }
        }, (error) => {
            console.log(error.message)
        })

        const unsubSensor = onValue(ref(db, 'sensor'), (snapshot) => {
            const data = snapshot.val()
            if (isSensorData(data)) {
                for (const callback of sensorCallbacks) {
                    callback.call(data)
                }
            }
        }, (error) => {
            console.log(error.message)
        })

        let timeoutId = 0
        const unsubStatus = onValue(ref(db, '.info/connected'), (snapshot) => {
            const data = snapshot.val()
            if (typeof data === 'boolean') {
                clearTimeout(timeoutId)
                setConnected((connected) => {
                    if (!connected) {
                        timeoutId = window.setTimeout(() => {
                            setConnected(data)
                        }, 1000)
                    }
                    return connected
                })
            }
        }, (error) => {
            console.log(error.message)
        })

        const unsubDevice = onValue(ref(db, 'device'), (snapshot) => {
            const data = snapshot.val()
            const devices = Object.keys(data)
                .filter(key => isDevice(data[key]))
                .reduce<DeviceData>((acc, key) => {
                    acc[key] = data[key]
                    return acc
                }, {})

            for (const callback of deviceCallbacks) {
                callback.call(data.lastOnline ?? 0, data.lastUpdate ?? 0, devices)
            }
        }, (error) => {
            console.log(error.message)
        })

        return () => {
            unsubAuth()
            unsubSensor()
            unsubStatus()
            unsubDevice()
        }
    }, [])

    useEffect(() => {
        if (!currentUser) {
            return
        }

        const unsubRelay = onValue(ref(db, 'relay'), (snapshot) => {
            const data = snapshot.val()
            if (isRelayData(data)) {
                for (const callback of relayCallbacks) {
                    callback.call(data)
                }
            }
        }, (error) => {
            console.log(error.message)
        })

        return () => {
            unsubRelay()
        }

    }, [currentUser])

    const memoizedValue = useMemo<IFirebase>(() => ({
        connected,
        signIn,
        signOut,
        onAuthChanged,
        onValueSensor,
        onValueRelay,
        onValueDevice,
        setRelay,
        setDevice,
        getYearList,
        getMonthList,
        getDayList,
        onYearList,
        onMonthList,
        onDayList,
        getData,
        getDataOfPeriod,
        getExportData
    }), [connected])

    return (
        <FirebaseContext.Provider value={memoizedValue}>
            {children}
        </FirebaseContext.Provider>
    )
}

export default function useFirebase() {
    return useContext(FirebaseContext)
}