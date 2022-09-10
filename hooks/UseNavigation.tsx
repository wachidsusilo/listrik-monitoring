import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

type ContentType = 'dashboard'|'history'|'control'

interface INavigation {
    navbarOpen: boolean,
    setNavbarOpen: Dispatch<SetStateAction<boolean>>,
    contentType: ContentType,
    setContentType: Dispatch<SetStateAction<ContentType>>
}

const NavigationContext = createContext<INavigation>({
    navbarOpen: false,
    setNavbarOpen: () => {},
    contentType: 'dashboard',
    setContentType: () => {}
})

interface NavigationProviderProps {
    children: ReactNode
}

export const NavigationProvider = ({children}: NavigationProviderProps) => {
    const [navbarOpen, setNavbarOpen] = useState<boolean>(false)
    const [contentType, setContentType] = useState<ContentType>('dashboard')

    return (
        <NavigationContext.Provider value={{navbarOpen, setNavbarOpen, contentType, setContentType}}>
            {children}
        </NavigationContext.Provider>
    )
}

export default function useNavigation() {
    return useContext(NavigationContext)
}