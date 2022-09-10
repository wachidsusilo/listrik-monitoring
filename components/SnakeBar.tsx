import useFirebase from '../hooks/UseFirebase'
import { useEffect, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

const SnakeBar = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const {connected} = useFirebase()
    const [open, setOpen] = useState<boolean>(!connected)
    const [isConnected, setIsConnected] = useState<boolean>(connected)
    const lastStatusRef = useRef<boolean>(connected)
    const timeoutIdRef = useRef<number>(0)

    useEffect(() => {
        const container = containerRef.current
        if (!container || lastStatusRef.current === connected) {
            return
        }

        setOpen((open) => {
            if (open) {
                container.ontransitionend = () => {
                    setIsConnected(connected)
                    lastStatusRef.current = connected
                    container.ontransitionend = null
                    setOpen(true)
                }
            } else {
                setIsConnected(connected)
                lastStatusRef.current = connected
            }
            return !open
        })

        clearTimeout(timeoutIdRef.current)
        if (connected) {
            timeoutIdRef.current = window.setTimeout(() => {
                setOpen(false)
            }, 3000)
        }

    }, [connected, containerRef.current])

    return (
        <div ref={containerRef} className={`absolute left-0 w-full h-[30px] flex items-center justify-between z-10 transition-[top]
        ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${open ? 'top-0' : '-top-[30px]'}`}>
            {
                isConnected ?
                    <>
                        <div className='ml-4 flex items-center gap-2 pointer-events-none'>
                            <CheckCircleIcon className='w-4 h-4 text-white'></CheckCircleIcon>
                            <span className='text-sm text-white select-none'>Terhubung kembali</span>
                        </div>
                        <button
                            className='w-[24px] h-[24px] mr-1'
                            onClick={() => {
                                setOpen(false)
                            }}>
                            <XMarkIcon className='w-4 h-4 text-white' />
                        </button>
                    </>
                    :
                    <div className='ml-4 flex items-center gap-2 pointer-events-none'>
                        <span className='w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                        <span className='text-sm text-white select-none'>Menghubungkan...</span>
                    </div>
            }
        </div>
    )
}

export default SnakeBar