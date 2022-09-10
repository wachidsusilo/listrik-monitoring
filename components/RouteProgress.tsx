import { CSSProperties, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

interface Props {
    delay?: number
    initialStyle?: CSSProperties
    startStyle?: CSSProperties
    endStyle?: CSSProperties
    postEndStyle?: CSSProperties
}

const RouteProgress = (
    {
        delay = 1,
        initialStyle = {width: 0, opacity: 1, transitionDuration: '0s'},
        startStyle = {width: '20%', transitionDuration: '2s'},
        endStyle = {width: '100%', transitionDuration: '0.5s'},
        postEndStyle = {width: '100%', opacity: 0, transitionDuration: '0.7s'}
    }: Props
) => {
    const [style, setStyle] = useState<CSSProperties>(initialStyle)
    const {events} = useRouter()
    const progressRef = useRef<HTMLDivElement>(null)
    const timeoutIdRef = useRef(0)
    const isRoutingRef = useRef(false)

    useEffect(() => {
        const progress = progressRef.current
        if (!progress) return

        const startPostEndTransition = () => {
            setStyle(postEndStyle)
            progress.ontransitionend = () => {
                setStyle(initialStyle)
            }
        }

        const stopLoading = () => {
            setStyle(endStyle)
            progress.ontransitionend = () => {
                startPostEndTransition()
            }
        }

        const startLoading = () => {
            setStyle(startStyle)
            isRoutingRef.current = true
        }

        const onStart = () => {
            window.clearTimeout(timeoutIdRef.current)
            timeoutIdRef.current = window.setTimeout(startLoading, delay)
        }

        const onStop = () => {
            window.clearTimeout(timeoutIdRef.current)
            if (isRoutingRef.current) {
                isRoutingRef.current = false
                stopLoading()
            }
        }

        events.on('routeChangeStart', onStart)
        events.on('routeChangeComplete', onStop)
        events.on('routeChangeError', onStop)

        return () => {
            window.clearTimeout(timeoutIdRef.current)
            events.off('routeChangeStart', onStart)
            events.off('routeChangeComplete', onStop)
            events.off('routeChangeError', onStop)
        }
    }, [progressRef, delay, initialStyle, startStyle, endStyle, postEndStyle])

    return (
        <div
            ref={progressRef}
            className="fixed w-0 h-0.5 top-0 left-0 bg-green-500 transition-[width,opacity] z-[100] overflow-hidden"
            style={{...style}}>
        </div>
    )
}

export default RouteProgress