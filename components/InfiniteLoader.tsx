import { ReactNode, useRef } from 'react'
import { ListOnItemsRenderedProps } from 'react-window'

type OnItemsRendered = (props: ListOnItemsRenderedProps) => any
type Ranges = Array<number>

interface OnItemsRenderedParams {
    visibleStartIndex: number
    visibleStopIndex: number
}

interface IUnloadedRange {
    isItemLoaded: (index: number) => boolean
    itemCount: number
    minimumBatchSize: number
    startIndex: number,
    stopIndex: number
}

const scanForUnloadedRanges = (
    {
        isItemLoaded,
        itemCount,
        minimumBatchSize,
        startIndex,
        stopIndex
    }: IUnloadedRange
): Ranges => {
    const unloadedRanges: Ranges = []
    let rangeStartIndex = null
    let rangeStopIndex = null

    for (let index = startIndex; index <= stopIndex; index++) {
        let loaded = isItemLoaded(index)

        if (!loaded) {
            rangeStopIndex = index
            if (rangeStartIndex === null) {
                rangeStartIndex = index
            }
        } else if (rangeStopIndex !== null) {
            unloadedRanges.push(
                rangeStartIndex ?? 0,
                rangeStopIndex
            )

            rangeStartIndex = rangeStopIndex = null
        }
    }

    if (rangeStopIndex !== null) {
        const potentialStopIndex = Math.min(
            Math.max(rangeStopIndex, (rangeStartIndex ?? 0) + minimumBatchSize - 1),
            itemCount - 1
        )

        for (let index = rangeStopIndex + 1; index <= potentialStopIndex; index++) {
            if (!isItemLoaded(index)) {
                rangeStopIndex = index
            } else {
                break
            }
        }

        unloadedRanges.push(
            rangeStartIndex ?? 0,
            rangeStopIndex
        )
    }

    if (unloadedRanges.length) {
        while (
            unloadedRanges[1] - unloadedRanges[0] + 1 < minimumBatchSize &&
            unloadedRanges[0] > 0
            ) {
            let index = unloadedRanges[0] - 1

            if (!isItemLoaded(index)) {
                unloadedRanges[0] = index
            } else {
                break
            }
        }
    }

    return unloadedRanges
}

const isRangeVisible = (
    lastRenderedStartIndex: number,
    lastRenderedStopIndex: number,
    startIndex: number,
    stopIndex: number
): boolean => {
    return !(
        startIndex > lastRenderedStopIndex || stopIndex < lastRenderedStartIndex
    )
}

interface Props {
    isItemLoaded: (index: number) => boolean
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void> | void
    itemCount: number
    children: (props: { onItemsRendered: OnItemsRendered; ref: (ref: any) => void }) => ReactNode
    threshold?: number | undefined
    minimumBatchSize?: number | undefined
}

const InfiniteLoader = (
    {
        isItemLoaded,
        loadMoreItems,
        itemCount,
        children,
        threshold = 15,
        minimumBatchSize = 10
    }: Props
) => {
    const lastRenderedStartIndex = useRef<number>(-1)
    const lastRenderedStopIndex = useRef<number>(-1)
    const listRef = useRef<any>(null)
    const unloadedRanges = useRef<Ranges>([])

    const loadUnloadedRanges = (ranges: Ranges) => {
        for (let i = 0; i < ranges.length; i += 2) {
            const start = ranges[i]
            const stop = ranges[i + 1]
            const promise = loadMoreItems(start, stop)

            if (promise) {
                promise.then(() => {
                    if (isRangeVisible(
                        lastRenderedStartIndex.current,
                        lastRenderedStopIndex.current,
                        start,
                        stop
                    )) {
                        if (listRef.current == null) {
                            return
                        }

                        if (typeof listRef.current.resetAfterIndex === 'function') {
                            listRef.current.resetAfterIndex(start, true)
                        } else {
                            if (typeof listRef.current._getItemStyleCache === 'function') {
                                listRef.current._getItemStyleCache(-1)
                            }
                            if (typeof listRef.current.forceUpdate === 'function') {
                                listRef.current.forceUpdate()
                            }
                        }
                    }
                })
            }
        }
    }

    const ensureRowsLoaded = (startIndex: number, stopIndex: number) => {
        const ranges = scanForUnloadedRanges({
            isItemLoaded,
            itemCount,
            minimumBatchSize: minimumBatchSize,
            startIndex: Math.max(0, startIndex - threshold),
            stopIndex: Math.min(itemCount - 1, stopIndex + threshold)
        })

        if (unloadedRanges.current.length !== ranges.length || unloadedRanges.current.some((v, i) => ranges[i] !== v)) {
            unloadedRanges.current = ranges
            loadUnloadedRanges(ranges)
        }
    }

    const resetLoadMoreItemsCache = (autoReload: boolean = false) => {
        unloadedRanges.current = []

        if (autoReload) {
            ensureRowsLoaded(lastRenderedStopIndex.current, lastRenderedStopIndex.current)
        }
    }

    const onItemsRendered = ({visibleStartIndex, visibleStopIndex}: OnItemsRenderedParams) => {
        lastRenderedStartIndex.current = visibleStartIndex
        lastRenderedStopIndex.current = visibleStopIndex
        ensureRowsLoaded(visibleStartIndex, visibleStopIndex)
    }

    return (
        <>
            {children({onItemsRendered, ref: (ref: any) => listRef.current = ref})}
        </>
    )
}

export default InfiniteLoader