import { NextPage } from 'next'
import useNavigation from '../hooks/UseNavigation'
import { useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/navigation/Header'
import Navigation from '../components/navigation/Navigation'
import NavigationOverlay from '../components/navigation/NavigationOverlay'
import ControllerContent from '../components/controller/ControllerContent'
import useAuth from '../hooks/UseAuth'
import { useRouter } from 'next/router'
import Loading from '../components/Loading'

const Controller: NextPage = () => {
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
            query: {origin: '/controller'}
        }, '/login').then()
        return null
    }

    return (
        <div className="flex w-full h-screen flex-col">
            <Head>
                <title>Monitoring Listrik</title>
                <link rel="icon" href="/favicon.png"/>
            </Head>

            {
                initialLoading ?
                    <Loading/>
                    :
                    <main className="relative w-full h-full flex flex-col">
                        <Header className="lg:!hidden"/>
                        <div className="relative h-[calc(100%-60px)] lg:h-full grow flex">
                            <Navigation/>
                            <section className="w-full h-full flex flex-col overflow-hidden">
                                <Header className="hidden lg:flex"/>
                                <ControllerContent/>
                            </section>
                        </div>
                        <NavigationOverlay/>
                    </main>
            }
        </div>
    )
}

export default Controller