import { useRef } from 'react'

const Loading = () => {
    const loadingRef = useRef<HTMLHeadingElement>(null)

    return (
        <div className="w-full h-full flex flex-col gap-6 items-center justify-center">
            <span className="w-16 h-16 border-[4px] border-t-transparent border-blue-500 rounded-full
            animate-spin"></span>
            <h1 ref={loadingRef} className='w-[70px] text-gray-600'>Memuat...</h1>
        </div>
    )
}

export default Loading