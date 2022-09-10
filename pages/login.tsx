import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import LoginContent from '../components/login/LoginContent'
import { useRouter } from 'next/router'
import useAuth from '../hooks/UseAuth'
import Loading from '../components/Loading'

const Login: NextPage = () => {
    const {user, initialLoading} = useAuth()
    const {push, query} = useRouter()

    if (!initialLoading && user) {
        if (query && typeof query.origin === 'string') {
            push(query.origin).then()
        } else {
            push('/').then()
        }
        return null
    }

    return (
        <div className="flex w-full h-[100vh] min-h-screen flex-col">
            <Head>
                <title>Monitoring Listrik</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {
                initialLoading ?
                    <Loading/>
                    :
                    <main className="relative w-full h-full flex flex-col">
                        <Link href='/'>
                            <a className='w-full h-[60px] px-4 shrink-0 flex items-center bg-blue-500
                            text-xl text-white font-medium'>
                                Monitoring Listrik
                            </a>
                        </Link>
                        <LoginContent/>
                    </main>
            }
        </div>
    )
}

export default Login