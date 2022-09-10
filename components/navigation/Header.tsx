import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline'
import useNavigation from '../../hooks/UseNavigation'
import useAuth from '../../hooks/UseAuth'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import useClickAnywhere from '../../hooks/UseClickAnywhere'
import {v4 as UUID} from 'uuid'

interface Props {
    className?: string
}

const Header = ({className = ''}: Props) => {
    const [open, setOpen] = useState<boolean>(false)
    const {navbarOpen, setNavbarOpen} = useNavigation()
    const {initialLoading, user, loading, signOut} = useAuth()
    const {register, unregister, dispatchClick} = useClickAnywhere()
    const id = useRef<string>(UUID())

    useEffect(() => {
        register(id.current, () => {
            setOpen(false)
        })

        return () => {
            unregister(id.current)
        }
    }, [])

    useEffect(() => {
        if (!user) {
            setOpen(false)
        }
    }, [user])

    const onClickMenu = () => {
        setNavbarOpen(!navbarOpen)
    }

    const onClickProfile: MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation()
        setOpen(!open)
        dispatchClick(id.current)
    }

    return (
        <header className={`relative w-full h-[60px] px-4 shrink-0 flex items-center justify-between shadow z-50 transition 
        ${navbarOpen ? 'bg-blue-500 lg:bg-white' : 'bg-white'} ${className}`}>
            <Bars3Icon
                className={`w-7 h-7 cursor-pointer transition 
                ${navbarOpen ? 'text-white lg:text-gray-800' : 'text-gray-800'}`}
                onClick={onClickMenu}/>
            {
                initialLoading ?
                    <span className='w-[20px] h-[20px] border-[3px] border-t-transparent border-blue-500 rounded-full
                    animate-spin'></span>
                    :
                    user ?
                        <>
                            <div
                                className="flex justify-end gap-2.5 cursor-pointer"
                                onClick={onClickProfile}>
                            <span className={`select-none transition 
                            ${navbarOpen ? 'text-white lg:text-gray-800' : 'text-gray-800'}`}>
                                {user.displayName ?? user.email}
                            </span>
                                <div className="w-7 h-7 rounded-full overflow-hidden">
                                    <UserCircleIcon className={`w-full h-full transition 
                                    ${navbarOpen ? 'text-white lg:text-gray-800' : 'text-gray-800'}`}/>
                                </div>
                            </div>
                            <button
                                className={`absolute top-[calc(100%+4px)] right-4 w-[100px] flex items-center justify-center select-none
                                rounded-[8px] bg-white text-gray-600 font-medium transition-[box-shadow,height] overflow-hidden
                                ${open ? 'h-[36px] shadow' : 'h-0 shadow-none'}`}
                                onClick={() => {
                                    if (!loading) {
                                        signOut()
                                    }
                                }}>
                                {
                                    loading ?
                                        <span className='w-[18px] h-[18px] border-[2px] border-t-transparent border-gray-600
                                        rounded-full animate-spin'></span>
                                        :
                                        'Logout'
                                }
                            </button>
                        </>
                        :
                        <Link href='/login'>
                            <a className={`w-[100px] h-[36px] flex items-center justify-center rounded-[8px]
                                transition active:scale-95 shadow 
                                ${navbarOpen ? 'bg-white text-blue-500 lg:bg-blue-500 lg:text-white' : 'bg-blue-500 text-white'}`}>
                                Login
                            </a>
                        </Link>
            }
        </header>
    )
}

export default Header