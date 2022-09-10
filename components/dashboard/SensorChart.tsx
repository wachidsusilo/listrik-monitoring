import { useEffect, useRef, useState } from 'react'
import Chart, {
    BubbleDataPoint,
    ChartConfiguration,
    ChartData,
    ChartTypeRegistry,
    ScatterDataPoint
} from 'chart.js/auto'
import DropDown from '../DropDown'
import useChart from '../../hooks/UseChart'
import { getPeriodList, toPeriodType } from '../../model/date'
import { formatDate, formatTime } from '../../utility/utils'
import Scroller, { ProgressEventHandler } from '../Scroller'

interface Props {
    className?: string
}

const SensorChart = ({className = ''}: Props) => {
    const [displayCount, setDisplayCount] = useState<number>(10)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const minRef = useRef<number>(0)
    const progressRef = useRef<ProgressEventHandler>(null)
    const {loading, data, periodType, setPeriodType} = useChart()
    const chartRef = useRef<Chart<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]>|null>(null)

    const isLine = () => {
        return periodType === 'today' || periodType === 'yesterday'
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }

        const barBackgroundColors = [
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(201, 203, 207, 0.5)'
        ]

        const barBorderColors = [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
        ]

        const chartData: ChartData<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[]> = {
            labels: [],
            datasets: [
                {
                    backgroundColor: isLine() ? 'rgb(59, 130, 246)' : barBackgroundColors,
                    borderColor: isLine() ? 'rgb(59, 130, 246)' : barBorderColors,
                    borderWidth: isLine() ? 3 : 1,
                    tension: 0.25,
                    data: []
                }
            ]
        }

        const config: ChartConfiguration = {
            type: isLine() ? 'line' : 'bar',
            data: chartData,
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        min: minRef.current,
                        max: displayCount
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        }

        chartRef.current = new Chart(canvas, config)

        let timeoutId = 0

        const onResize = () => {
            setDisplayCount(canvas.width / 50)
        }

        window.addEventListener('resize', onResize)
        setDisplayCount(canvas.width / 50)

        return () => {
            window.removeEventListener('resize', onResize)
            window.clearTimeout(timeoutId)
            chartRef.current?.destroy()
            chartRef.current = null
        }

    }, [canvasRef.current, periodType])

    useEffect(() => {
        const canvas = canvasRef.current
        const progress = progressRef.current

        if (!canvas || !progress) {
            return
        }

        let isActive = false
        let originX = 0

        const onDown = (e: MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
            isActive = true
            originX = e.x
        }

        const onUp = () => {
            if (isActive) {
                isActive = false
            }
        }

        const onMove = (e: MouseEvent) => {
            if (isActive) {
                const distance = e.x - originX
                const progressDiff = (-distance / 50) / data.length
                originX = e.x
                progress.setProgress((currentProgress) => currentProgress + progressDiff)
            }
        }

        const onWheel = (e: WheelEvent) => {
            const progressDiff = (e.deltaY / 100) / (data.length - displayCount)
            progress.setProgress((currentProgress) => currentProgress + progressDiff)
        }

        canvas.addEventListener('wheel', onWheel)
        canvas.addEventListener('mousedown', onDown)
        window.addEventListener('mouseup', onUp)
        window.addEventListener('mousemove', onMove)

        return () => {
            canvas.removeEventListener('wheel', onWheel)
            canvas.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
            window.removeEventListener('mousemove', onMove)
        }
    }, [canvasRef.current, progressRef.current, data, displayCount])

    useEffect(() => {
        const progress = progressRef.current
        const chart = chartRef.current

        if (!progress || !chart) {
            return
        }

        progress.onscroll = (progress) => {
            const min = progress * (data.length - displayCount)
            if (minRef.current !== min && chart.options.scales?.x) {
                minRef.current = min
                chart.options.scales.x.min = min
                chart.options.scales.x.max = min + displayCount
                chart.update()
            }
        }

        chart.data.labels = data.map(value => isLine() ? formatTime(value.dateTime) : formatDate(value.dateTime, true))
        chart.data.datasets[0].data = data.map(value => value.total.energy)
        progress.setProgress(1)

    }, [chartRef.current, progressRef.current, data])

    useEffect(() => {
        const chart = chartRef.current
        if (!chart) {
            return
        }

        if (chart.options.scales?.x) {
            chart.options.scales.x.max = minRef.current + displayCount
            chart.update()
        }

    }, [chartRef.current, displayCount])

    return (
        <div
            className={`relative h-full min-h-[400px] grid grid-rows-[60px_1fr] xs:grid-rows-[50px_1fr] bg-white rounded-[8px] shadow overflow-hidden ${className}`}>
            <div className="h-[60px] xs:h-[50px] px-4 flex items-center justify-between border-b border-b-gray-100
            text-blue-500 xs:text-lg font-medium">
                <span>Penggunaan Daya Listrik</span>
                <DropDown
                    className="w-[120px] text-[15px] font-normal"
                    selected="Hari ini"
                    items={getPeriodList()}
                    disabled={loading}
                    onItemSelected={(selected) => {
                        setPeriodType(toPeriodType(selected))
                    }}/>
            </div>
            <div className="relative w-[calc(100%-2rem)] h-[calc(100%-30px)] mx-4 my-3 overflow-hidden">
                <canvas ref={canvasRef}></canvas>
                {
                    loading && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white">
                            <span className="w-16 h-16 border-[3px] border-t-transparent border-blue-500
                            rounded-full animate-spin"></span>
                        </div>
                    )
                }
            </div>
            <Scroller
                ref={progressRef}
                className='absolute w-[calc(100%-70px)] h-[10px] left-1/2 bottom-[4px] -translate-x-1/2 bg-blue-50 rounded-[2px] overflow-hidden'
                dataLength={displayCount}
                totalLength={data.length} />
        </div>
    )
}

export default SensorChart