import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NavigationProvider } from '../hooks/UseNavigation'
import RouteProgress from '../components/RouteProgress'
import { ClickAnywhereProvider } from '../hooks/UseClickAnywhere'
import { FirebaseProvider } from '../hooks/UseFirebase'
import { AuthProvider } from '../hooks/UseAuth'

function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <RouteProgress />
            <FirebaseProvider>
                <AuthProvider>
                    <NavigationProvider>
                        <ClickAnywhereProvider>
                            <Component {...pageProps} />
                        </ClickAnywhereProvider>
                    </NavigationProvider>
                </AuthProvider>
            </FirebaseProvider>
        </>
    )
}

export default MyApp
