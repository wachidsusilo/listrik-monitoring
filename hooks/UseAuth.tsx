import { User } from 'firebase/auth'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import useFirebase from './UseFirebase'

interface IAuthContext {
    user: User | null
    initialLoading: boolean
    loading: boolean
    error: string | null
    signIn(email: string, password: string): void
    signOut(): void
}

const AuthContext = createContext<IAuthContext>({
    user: null,
    initialLoading: true,
    loading: false,
    error: null,
    signIn(){},
    signOut() {}
})

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({children}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [initialLoading, setInitialLoading] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const {onAuthChanged, signIn: login, signOut: logout} = useFirebase()

    useEffect(() => {
        const unsub = onAuthChanged((user) => {
            setUser(user)
            setInitialLoading(false)
        })

        return () => {
            unsub()
        }
    }, [])

    const signIn = useCallback((email: string, password: string) => {
        setLoading(true)
        setError(null)
        login(email, password)
            .then((user) => {
                setUser(user)
            })
            .catch((reason) => {
                console.log(reason)
                setError(reason?.code ?? 'unknown error')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const signOut = useCallback(() => {
        setLoading(true)
        setError(null)
        logout()
            .then(() => {
                setLoading(false)
            })
            .catch((reason) => {
                console.log(reason)
                setError(reason?.code ?? 'unknown error')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const memoizedValue = useMemo<IAuthContext>(() => ({
        user,
        initialLoading,
        loading,
        error,
        signIn,
        signOut
    }), [user, initialLoading, loading, error])

    return (
        <AuthContext.Provider value={memoizedValue}>
            {children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext)
}