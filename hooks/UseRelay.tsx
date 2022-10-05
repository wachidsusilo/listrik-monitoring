import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import useFirebase from './UseFirebase'
import { RelayData } from '../model/relay'

interface IRelayContext {
    relayData: RelayData
    setRelayOn(relayId: string, value: number): void
    setRelayOff(relayId: string, value: number): void
    setRelayMode(relayId: string, isAuto: boolean): void
    setRelayState(relayId: string, isOn: boolean): void
}

const RelayContext = createContext<IRelayContext>({
    relayData: {},
    setRelayOn() {},
    setRelayOff() {},
    setRelayMode() {},
    setRelayState() {}
})

interface RelayProviderProps {
    children: ReactNode
}

export const RelayProvider = ({children}: RelayProviderProps) => {
    const [relayData, setRelayData] = useState<RelayData>({})
    const {onValueRelay, setRelay} = useFirebase()

    useEffect(() => {
        const unsub = onValueRelay((relay) => {
            setRelayData(relay)
        })

        return () => {
            unsub()
        }
    }, [])

    const setRelayOn = useCallback((relayId: string, value: number) => {
        setRelay(relayId, 'on', value)
    }, [])

    const setRelayOff = useCallback((relayId: string, value: number) => {
        setRelay(relayId, 'off', value)
    }, [])

    const setRelayMode = useCallback((relayId: string, isAuto: boolean) => {
        setRelay(relayId, 'auto', isAuto)
    }, [])

    const setRelayState = useCallback((relayId: string, isOn: boolean) => {
        setRelay(relayId, 'state', isOn)
    }, [])

    return (
        <RelayContext.Provider value={{relayData, setRelayOn, setRelayOff, setRelayMode, setRelayState}}>
            {children}
        </RelayContext.Provider>
    )
}

export default function useRelay() {
    return useContext(RelayContext)
}