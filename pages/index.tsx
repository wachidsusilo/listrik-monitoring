import type { NextPage } from 'next'
import Head from 'next/head'
import Header from '../components/navigation/Header'
import Navigation from '../components/navigation/Navigation'
import NavigationOverlay from '../components/navigation/NavigationOverlay'
import useNavigation from '../hooks/UseNavigation'
import { useEffect } from 'react'
import DashboardContent from '../components/dashboard/DashboardContent'

const Home: NextPage = () => {
    const {setNavbarOpen} = useNavigation()

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setTimeout(() => {
                setNavbarOpen(false)
            }, 10)
        }
    }, [])

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden">
            <Head>
                <title>Monitoring Listrik</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className="w-full h-full flex flex-col">
                <Header className='lg:!hidden'/>
                <div className='relative h-[calc(100%-60px)] lg:h-full grow flex'>
                    <Navigation />
                    <section className='w-full h-full flex flex-col'>
                        <Header className='hidden lg:flex'/>
                        <DashboardContent />
                    </section>
                </div>
                <NavigationOverlay/>
            </main>
        </div>
    )
}

export default Home
