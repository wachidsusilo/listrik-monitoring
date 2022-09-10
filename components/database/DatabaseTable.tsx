import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { CSSProperties } from 'react'
import useSensor from '../../hooks/UseSensor'
import InfiniteLoader from 'react-window-infinite-loader'
import useDatabase from '../../hooks/UseDatabase'
import { formatTime, formatDate, getPrecision } from '../../utility/utils'
import { InboxStackIcon } from '@heroicons/react/24/outline'

interface Props {
    className?: string
}

const DatabaseTable = ({className = ''}: Props) => {
    const {sensor1, sensor2, sensor3, sensor4} = useSensor()
    const {data, hasNextPage, loadData, loading} = useDatabase()

    const gridCols = 'grid-cols-[minmax(140px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)]'
    const headerStyle = 'h-[64px] flex items-center justify-center text-center text-gray-600 select-none whitespace-pre-line font-medium text-sm'
    const bodyStyle = 'flex items-center justify-center text-gray-600 select-none'

    const Rows = ({index, style}: { index: number, style: CSSProperties }) => {
        const sensor = data[index]
        return (
            <div
                className={`relative grid hover:bg-blue-50 ${isItemLoaded(index) ?  gridCols : 'grid-cols-1'}`}
                style={{...style}}>
                {
                    sensor ?
                        <>
                            <div className={bodyStyle}>{formatDate(sensor.dateTime)}</div>
                            <div className={bodyStyle}>{formatTime(sensor.dateTime)}</div>
                            <div className={bodyStyle}>{sensor.sensor1.energy.toFixed(getPrecision(sensor.sensor1.energy))}</div>
                            <div className={bodyStyle}>{sensor.sensor2.energy.toFixed(getPrecision(sensor.sensor2.energy))}</div>
                            <div className={bodyStyle}>{sensor.sensor3.energy.toFixed(getPrecision(sensor.sensor3.energy))}</div>
                            <div className={bodyStyle}>{sensor.sensor4.energy.toFixed(getPrecision(sensor.sensor4.energy))}</div>
                            <div className={bodyStyle}>{sensor.total.energy.toFixed(getPrecision(sensor.total.energy))}</div>
                        </>
                        :
                        isItemLoaded(index) ?
                            Array(7).fill(0).map((_, idx) => (
                                <div key={idx} className={bodyStyle}></div>
                            ))
                            :
                            <div className={bodyStyle}>
                                <span className='w-[12px] h-[12px] border-[2px] border-t-transparent border-blue-500 rounded-full
                                animate-spin'></span>
                            </div>
                }
                <div
                    className="w-[calc(100%-2rem)] absolute left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-200"></div>
            </div>
        )
    }

    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < data.length
    }

    return (
        <div
            className={`relative w-full min-w-[640px] grow flex flex-col bg-white rounded-[8px] overflow-hidden shadow ${className}`}>
            <div className={`relative grid ${gridCols}`}>
                <div className={headerStyle}>Tanggal</div>
                <div className={headerStyle}>Waktu</div>
                <div className={headerStyle}>{`${sensor1.name}\n(kWh)`}</div>
                <div className={headerStyle}>{`${sensor2.name}\n(kWh)`}</div>
                <div className={headerStyle}>{`${sensor3.name}\n(kWh)`}</div>
                <div className={headerStyle}>{`${sensor4.name}\n(kWh)`}</div>
                <div className={headerStyle}>{`Total\n(kWh)`}</div>
                <div
                    className="w-[calc(100%-2rem)] absolute left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-300"></div>
            </div>
            <div className="w-full h-full">
                <AutoSizer>
                    {
                        ({width, height}) => {
                            const minCount = height / 30
                            const count = hasNextPage ? data.length + 1 : data.length
                            const itemCount = count > minCount ? count : minCount
                            return (
                                <InfiniteLoader
                                    isItemLoaded={isItemLoaded}
                                    loadMoreItems={loading ? () => {} : loadData}
                                    minimumBatchSize={30}
                                    itemCount={itemCount}>
                                    {
                                        ({onItemsRendered, ref}) => (
                                            <FixedSizeList
                                                className="scrollbar-thin-blue"
                                                onItemsRendered={onItemsRendered}
                                                ref={ref}
                                                itemSize={30}
                                                height={height}
                                                overscanCount={10}
                                                itemCount={itemCount}
                                                width={width}>
                                                {Rows}
                                            </FixedSizeList>
                                        )
                                    }
                                </InfiniteLoader>
                            )
                        }
                    }
                </AutoSizer>
            </div>
            {
                data.length === 0 && (
                    <div className='absolute top-[64px] w-full h-[calc(100%-64px)] flex flex-col gap-2 items-center justify-center text-gray-500 bg-white'>
                        {
                            loading ?
                                <span className='w-16 h-16 border-[3px] border-t-transparent border-blue-500 rounded-full
                                animate-spin'></span>
                                :
                                <>
                                    <InboxStackIcon className='w-16 h-16 text-gray-300' />
                                    <span>Tidak ada data</span>
                                </>
                        }
                    </div>
                )
            }
        </div>
    )
}

export default DatabaseTable