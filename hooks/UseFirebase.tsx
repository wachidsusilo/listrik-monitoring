import { initializeApp } from 'firebase/app'
import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as logOut } from 'firebase/auth'
import { getDatabase, onValue, ref, set, get, query, orderByKey } from 'firebase/database'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { SensorData, isSensorData, ExtendedSensorValueData, isSensorValueData } from '../model/sensor'
import { RelayData, isRelayData, RelayType, Relay } from '../model/relay'
import { v4 as UUID } from 'uuid'
import { Device, isDevice } from '../model/device'
import { formatTime } from '../utility/utils'

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
    call(device: Device): void
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

const onValueDevice = (call: (device: Device) => void) => {
    const id = UUID()
    deviceCallbacks.push({id, call})
    if (auth.currentUser) {
        get(ref(db, 'device'))
            .then((value) => {
                const data = value.val()
                if (isDevice(data)) {
                    call(data)
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

const setRelay = (relayType: RelayType, field: keyof Relay, value: string | number | boolean) => {
    if (auth.currentUser) {
        set(ref(db, `relay/${relayType}/${field}`), value).then()
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

const getData = (dateString: string) =>
    new Promise<Array<ExtendedSensorValueData>>((resolve, reject) => {
        const date = new Date(dateString)
        if (isNaN(date.getDate())) {
            reject('invalid date')
            return
        }

        const year = date.getFullYear().toString()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = (date.getDate()).toString().padStart(2, '0')

        get(query(ref(db, `data/${year}/${month}/${day}`), orderByKey()))
            .then((snapshot) => {
                const data = snapshot.val()
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})
                    const sensorData: Array<ExtendedSensorValueData> = Object.keys(data).sort(collator.compare)
                        .filter(key => isSensorValueData(data[key]))
                        .map(value => ({
                            dateTime: `${year}-${month}-${day}T${formatTime(Number.parseInt(value))}`,
                            sensor1: data[value].sensor1,
                            sensor2: data[value].sensor2,
                            sensor3: data[value].sensor3,
                            sensor4: data[value].sensor4,
                            total: {
                                energy: data[value].sensor1.energy + data[value].sensor2.energy + data[value].sensor3.energy + data[value].sensor4.energy,
                                power: data[value].sensor1.power + data[value].sensor2.power + data[value].sensor3.power + data[value].sensor4.power
                            }
                        }))
                    resolve(sensorData)
                }
            })
            .catch(reject)
    })

interface IFirebase {
    connected: boolean
    signIn(email: string, password: string): Promise<User | null>
    signOut(): Promise<void>
    onAuthChanged(call: (user: User | null) => void): Unsubscribe
    onValueSensor(call: (sensor: SensorData) => void): Unsubscribe
    onValueRelay(call: (relay: RelayData) => void): Unsubscribe
    onValueDevice(call: (device: Device) => void): Unsubscribe
    setRelay(relayType: RelayType, field: keyof Relay, value: string | number | boolean): void
    getYearList(): Promise<Array<string>>
    getMonthList(year: string): Promise<Array<string>>
    getDayList(year: string, month: string): Promise<Array<string>>
    onYearList(call: (yearList: Array<string>) => void): Unsubscribe
    onMonthList(year: string, call: (monthList: Array<string>) => void): Unsubscribe
    onDayList(year: string, month: string, call: (dayList: Array<string>) => void): Unsubscribe
    getData(dateString: string): Promise<Array<ExtendedSensorValueData>>
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
    getYearList,
    getMonthList,
    getDayList,
    onYearList,
    onMonthList,
    onDayList,
    getData
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

        return () => {
            unsubAuth()
            unsubSensor()
            unsubStatus()
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

        const unsubDevice = onValue(ref(db, 'device'), (snapshot) => {
            const data = snapshot.val()
            if (isDevice(data)) {
                for (const callback of deviceCallbacks) {
                    callback.call(data)
                }
            }
        }, (error) => {
            console.log(error.message)
        })

        return () => {
            unsubRelay()
            unsubDevice()
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
        getYearList,
        getMonthList,
        getDayList,
        onYearList,
        onMonthList,
        onDayList,
        getData
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