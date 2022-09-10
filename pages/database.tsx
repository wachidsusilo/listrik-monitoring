import { NextPage } from 'next'
import Head from 'next/head'
import Header from '../components/navigation/Header'
import Navigation from '../components/navigation/Navigation'
import NavigationOverlay from '../components/navigation/NavigationOverlay'
import useNavigation from '../hooks/UseNavigation'
import { useEffect } from 'react'
import DatabaseContent from '../components/database/DatabaseContent'
import useAuth from '../hooks/UseAuth'
import { useRouter } from 'next/router'
import Loading from '../components/Loading'

const Database: NextPage = () => {
    const {setNavbarOpen} = useNavigation()
    const {user, initialLoading} = useAuth()
    const {push} = useRouter()

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setTimeout(() => {
                setNavbarOpen(false)
            }, 10)
        }
    }, [])

    if (!initialLoading && !user) {
        push({
            pathname: '/login',
            query: {origin: '/database'}
        }, '/login').then()
        return null
    }

    return (
        <div className="flex w-full h-screen flex-col">
            <Head>
                <title>Monitoring Listrik</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            {
                initialLoading ?
                    <Loading/>
                    :
                    <main className="relative w-full h-full flex flex-col">
                        <Header className="lg:!hidden"/>
                        <div className="w-full h-full flex">
                            <Navigation/>
                            <section className="w-full h-full flex flex-col">
                                <Header className="hidden lg:flex"/>
                                <DatabaseContent/>
                            </section>
                        </div>
                        <NavigationOverlay/>
                    </main>
            }
        </div>
    )
}

export default Database