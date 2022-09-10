import { ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

export interface ProgressEventHandler {
    setProgress(valueOrProcessor: ((currentProgress: number) => number) | number): void
    onscroll?: (progress: number) => void
}

interface Props {
    className?: string
    dataLength: number
    totalLength: number
}

const Scroller: ForwardRefRenderFunction<ProgressEventHandler, Props> = (
    {
        className,
        dataLength,
        totalLength
    }: Props,
    ref
) => {
    const positionRef = useRef<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)
    const handlerRef = useRef<ProgressEventHandler>({
        setProgress(){}
    })

    useImperativeHandle(ref, () => {
        handlerRef.current.setProgress = (valueOrProcessor: ((progress: number) => number) | number) => {
            const container = containerRef.current
            const scroller = scrollerRef.current

            if (!ref || !container || !scroller) {
                return
            }

            const width = container.clientWidth - scroller.clientWidth
            let progress: number

            if (typeof valueOrProcessor === 'function') {
                progress = valueOrProcessor(positionRef.current / width)
            } else {
                progress = valueOrProcessor
            }

            if (progress < 0) {
                progress = 0
            }

            if (progress > 1) {
                progress = 1
            }

            positionRef.current = progress * width
            scroller.style.left = `${positionRef.current}px`
            if (handlerRef.current.onscroll) {
                handlerRef.current.onscroll(progress)
            }
        }
        return handlerRef.current
    }, [containerRef.current, scrollerRef.current])

    useEffect(() => {
        const container = containerRef.current
        const scroller = scrollerRef.current

        if (!container || !scroller) {
            return
        }

        let isActive = false
        let originX = 0
        let lastPosition = 0

        const isScrollable = () => {
            return dataLength !== totalLength
        }

        const onDown = (e: MouseEvent) => {
            if (!isScrollable()) {
                return
            }
            e.stopPropagation()
            e.preventDefault()
            isActive = true
            originX = e.x
        }

        const onUp = () => {
            if (isActive) {
                isActive = false
                positionRef.current = Number.parseInt(scroller.style.left) ?? 0
            }
        }

        const onMove = (e: MouseEvent) => {
            if (isActive) {
                const width = container.clientWidth - scroller.clientWidth
                const distance = e.x - originX
                let newPosition = positionRef.current + distance

                if (newPosition < 0) {
                    newPosition = 0
                }

                if (newPosition > width) {
                    newPosition = width
                }

                scroller.style.left = `${newPosition}px`

                if (handlerRef.current.onscroll && newPosition !== lastPosition) {
                    lastPosition = newPosition
                    handlerRef.current.onscroll(newPosition / width)
                }
            }
        }

        const onContainerDown = (e: MouseEvent) => {
            if (!isScrollable()) {
                return
            }
            onDown(e)
            const width = container.clientWidth - scroller.clientWidth
            let newPosition = e.x - container.getBoundingClientRect().left - scroller.clientWidth / 2

            if (newPosition < 0) {
                newPosition = 0
            }

            if (newPosition > width) {
                newPosition = width
            }

            positionRef.current = newPosition
            scroller.style.left = `${newPosition}px`

            if (handlerRef.current.onscroll && newPosition !== lastPosition) {
                lastPosition = newPosition
                handlerRef.current.onscroll(newPosition / width)
            }
        }

        const onResize = () => {
            let scrollerWidth = (dataLength / totalLength) * container.clientWidth
            if (scrollerWidth < 25) {
                scrollerWidth = 25
            }
            scroller.style.width = `${scrollerWidth}px`
            scroller.style.left = `${positionRef.current}px`
        }
        onResize()

        container.addEventListener('mousedown', onContainerDown)
        scroller.addEventListener('mousedown', onDown)
        window.addEventListener('mouseup', onUp)
        window.addEventListener('mousemove', onMove)
        window.addEventListener('resize', onResize)

        return () => {
            container.removeEventListener('mousedown', onContainerDown)
            scroller.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('resize', onResize)
        }
    }, [containerRef.current, scrollerRef.current, dataLength, totalLength])

    return (
        <div ref={containerRef} className={className}>
            <div
                ref={scrollerRef}
                className={`absolute h-full 
                ${dataLength >= totalLength ? 'bg-transparent cursor-default' : 'bg-blue-400 cursor-pointer'}`}>
            </div>
        </div>
    )
}

export default forwardRef(Scroller)