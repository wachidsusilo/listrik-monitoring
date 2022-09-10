import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import useFirebase from './UseFirebase'
import { isRelayEqual, Relay, RelayData, RelayType } from '../model/relay'

interface IRelayContext extends RelayData {
    setRelayOn(relayType: RelayType, value: number): void
    setRelayOff(relayType: RelayType, value: number): void
    setRelayMode(relayType: RelayType, isAuto: boolean): void
    setRelayState(relayType: RelayType, isOn: boolean): void
}

const RelayContext = createContext<IRelayContext>({
    relay1: {name: '', on: 0, off: 0, auto: false, state: false},
    relay2: {name: '', on: 0, off: 0, auto: false, state: false},
    relay3: {name: '', on: 0, off: 0, auto: false, state: false},
    relay4: {name: '', on: 0, off: 0, auto: false, state: false},
    setRelayOn() {},
    setRelayOff() {},
    setRelayMode() {},
    setRelayState() {}
})

interface RelayProviderProps {
    children: ReactNode
}

export const RelayProvider = ({children}: RelayProviderProps) => {
    const [relay1, setRelay1] = useState<Relay>({name: 'Relay 1', on: 0, off: 0, auto: false, state: false})
    const [relay2, setRelay2] = useState<Relay>({name: 'Relay 2', on: 0, off: 0, auto: false, state: false})
    const [relay3, setRelay3] = useState<Relay>({name: 'Relay 3', on: 0, off: 0, auto: false, state: false})
    const [relay4, setRelay4] = useState<Relay>({name: 'Relay 4', on: 0, off: 0, auto: false, state: false})
    const {onValueRelay, setRelay} = useFirebase()

    useEffect(() => {
        const unsub = onValueRelay((relay) => {
            setRelay1((value) => {
                if (!isRelayEqual(value, relay.relay1)) {
                    return relay.relay1
                }
                return value
            })
            setRelay2((value) => {
                if (!isRelayEqual(value, relay.relay2)) {
                    return relay.relay2
                }
                return value
            })
            setRelay3((value) => {
                if (!isRelayEqual(value, relay.relay3)) {
                    return relay.relay3
                }
                return value
            })
            setRelay4((value) => {
                if (!isRelayEqual(value, relay.relay4)) {
                    return relay.relay4
                }
                return value
            })
        })

        return () => {
            unsub()
        }
    }, [])

    const setRelayOn = useCallback((relayType: RelayType, value: number) => {
        setRelay(relayType, 'on', value)
    }, [])

    const setRelayOff = useCallback((relayType: RelayType, value: number) => {
        setRelay(relayType, 'off', value)
    }, [])

    const setRelayMode = useCallback((relayType: RelayType, isAuto: boolean) => {
        setRelay(relayType, 'auto', isAuto)
    }, [])

    const setRelayState = useCallback((relayType: RelayType, isOn: boolean) => {
        setRelay(relayType, 'state', isOn)
    }, [])

    return (
        <RelayContext.Provider value={{relay1, relay2, relay3, relay4, setRelayOn, setRelayOff, setRelayMode, setRelayState}}>
            {children}
        </RelayContext.Provider>
    )
}

export default function useRelay() {
    return useContext(RelayContext)
}