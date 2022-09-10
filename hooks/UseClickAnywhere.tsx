import { createContext, ReactNode, useContext, useEffect } from 'react'

interface ClickCallback {
    id: string
    call: () => void
    windowEvent: boolean
}

const callbacks: Array<ClickCallback> = []

const register = (id: string, call: () => void, windowEvent: boolean = true) => {
    if (!callbacks.some(value => value.id === id)) {
        callbacks.push({id, call, windowEvent})
    }
}

const unregister = (id: string) => {
    const idx = callbacks.findIndex(value => value.id === id)
    if (idx >= 0) {
        callbacks.splice(idx, 1)
    }
}

const dispatchClick = (...excludeIds: Array<string>) => {
    for (const callback of callbacks) {
        if (!excludeIds.some(id => id === callback.id)) {
            callback.call()
        }
    }
}

interface IClickAnywhere {
    register(id: string, call: () => void, windowEvent?: boolean): void
    unregister(id: string): void
    dispatchClick(...excludeIds: Array<string>): void
}

const ClickAnywhereContext = createContext<IClickAnywhere>({
    register,
    unregister,
    dispatchClick
})

interface ClickAnywhereProviderProps {
    children: ReactNode
}

export const ClickAnywhereProvider = ({children}: ClickAnywhereProviderProps) => {

    useEffect(() => {
        window.onclick = () => {
            for (const callback of callbacks) {
                if (callback.windowEvent) {
                    callback.call()
                }
            }
        }
    }, [])

    return (
        <ClickAnywhereContext.Provider value={{register,
            unregister,
            dispatchClick
        }}>
            {children}
        </ClickAnywhereContext.Provider>
    )
}

export default function useClickAnywhere() {
    return useContext(ClickAnywhereContext)
}