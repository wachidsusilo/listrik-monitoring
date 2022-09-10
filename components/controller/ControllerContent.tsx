import ControllerTable from './ControllerTable'
import useDevice from '../../hooks/UseDevice'
import { momentDateTime, momentElapsedTime } from '../../utility/utils'
import SnakeBar from '../SnakeBar'
import { useEffect, useRef } from 'react'

interface Props {
    className?: string
}

const ControllerContent = ({className = ''}: Props) => {
    const {online, lastOnline, lastUpdate} = useDevice()
    const infoRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        const info = infoRef.current
        if (!info || !online || lastUpdate === 0) {
            return
        }

        const intervalId = window.setInterval(() => {
            info.innerText = `Terakhir update ${momentElapsedTime(lastUpdate)}`
        }, 60000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [infoRef.current, online, lastUpdate])

    return (
        <div className={`relative w-full h-full flex flex-col ${className}`}>
            <h2 className='shrink-0 px-8 mt-8 text-gray-800 text-3xl select-none'>Kontrol</h2>
            <p className={`shrink-0 px-8 mt-2 font-medium select-none ${online ? 'text-green-500' : 'text-red-500'}`}>
                {online ? 'Online' : 'Offline'}
            </p>
            <p ref={infoRef} className='shrink-0 px-8 text-sm text-gray-500 select-none'>
                {
                    online
                        ? lastUpdate === 0
                            ? 'Terakhir update tidak diketahui'
                            : `Terakhir update ${momentElapsedTime(lastUpdate)}`
                        : lastOnline === 0
                            ? 'Terakhir online tidak diketahui'
                            : `Terakhir online ${momentDateTime(lastOnline)}`
                }
            </p>
            <div className='w-full h-full flex overflow-y-hidden scrollbar-thin-blue'>
                <div className='h-auto px-8 basis-0 grow'>
                    <ControllerTable className='mt-12 mb-4' />
                </div>
            </div>
            <SnakeBar />
        </div>
    )
}

export default ControllerContent