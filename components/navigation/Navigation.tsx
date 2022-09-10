import {
    CircleStackIcon,
    CursorArrowRippleIcon,
    LightBulbIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import useNavigation from '../../hooks/UseNavigation'
import Link from 'next/link'
import useAuth from '../../hooks/UseAuth'
import { LockClosedIcon } from '@heroicons/react/20/solid'

interface Props {
    className?: string
}

const Navigation = ({className = ''}: Props) => {
    const {navbarOpen, setNavbarOpen, contentType, setContentType} = useNavigation()
    const {user} = useAuth()

    const onClickDashboard = () => {
        if (window.innerWidth < 1024 && contentType === 'dashboard') {
            setNavbarOpen(false)
        }
        setContentType('dashboard')
    }

    const onClickHistory = () => {
        if (window.innerWidth < 1024 && contentType === 'history') {
            setNavbarOpen(false)
        }
        setContentType('history')
    }

    const onClickControl = () => {
        if (window.innerWidth < 1024 && contentType === 'control') {
            setNavbarOpen(false)
        }
        setContentType('control')
    }

    return (
        <nav
            className={`absolute lg:relative top-0 left-0 w-[300px] h-full pt-[60px] lg:pt-0 shrink-0 grow flex flex-col bg-blue-500 transition-[margin] z-40 
            ${navbarOpen ? 'ml-0' : '-ml-[300px]'} ${className}`}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}>
            <a className='relative w-full flex px-4 py-8 overflow-hidden'>
                <LightBulbIcon className='w-12 h-12 text-white' />
                <h1 className='text-white flex-1 text-center text-xl font-medium select-none whitespace-pre-line'>{'Monitoring \n Listrik'}</h1>
                <div className='absolute bottom-0 w-[calc(100%-2rem)] border-b border-white/20'></div>
            </a>
            <Link href='/' target='_blank' passHref={true}>
                <a
                    className='relative w-full px-4 py-4 flex gap-4 items-center cursor-pointer group hover:bg-white/10'
                    onClick={onClickDashboard}>
                    <PresentationChartLineIcon className={`w-6 h-6 text-white`} />
                    <h1 className={`flex-1 select-none text-white`}>Dashboard</h1>
                    <div className='absolute bottom-0 w-[calc(100%-2rem)] border-b border-white/20'></div>
                </a>
            </Link>
            <Link href='/database' target='_blank' passHref={true}>
                <a
                    className='relative w-full px-4 py-4 flex items-center cursor-pointer group hover:bg-white/10'
                    onClick={onClickHistory}>
                    <CircleStackIcon className={`w-6 h-6 text-white`} />
                    <h1 className={`ml-4 flex-1 select-none text-white`}>Database</h1>
                    {
                        !user && <LockClosedIcon className={`w-4 h-4 text-white`} />
                    }
                    <div className='absolute bottom-0 w-[calc(100%-2rem)] border-b border-white/20'></div>
                </a>
            </Link>
            <Link href='/controller' target='_blank' passHref={true}>
                <a
                    className='relative w-full px-4 py-4 flex items-center cursor-pointer group hover:bg-white/10'
                    onClick={onClickControl}>
                    <CursorArrowRippleIcon className={`w-6 h-6 text-white`} />
                    <h1 className={`ml-4 flex-1 select-none text-white`}>Kontrol</h1>
                    {
                        !user && <LockClosedIcon className={`w-4 h-4 text-white`} />
                    }
                    <div className='absolute bottom-0 w-[calc(100%-2rem)] border-b border-white/20'></div>
                </a>
            </Link>
        </nav>
    )
}

export default Navigation