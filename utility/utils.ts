
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const isToday = (date: Date) => {
    const now = new Date()
    return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate()
}

const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date.getFullYear() === yesterday.getFullYear()
        && date.getMonth() === yesterday.getMonth()
        && date.getDate() === yesterday.getDate()
}

const padZero = (value: number) => {
    return value.toString().padStart(2, '0')
}

export const formatDate = (timestamp: number | string, simplify: boolean = false) => {
    const date = new Date(timestamp)
    const month = simplify ? months[date.getMonth()].slice(0, 3) : months[date.getMonth()]
    const year = simplify ? date.getFullYear().toString().slice(2,4) : date.getFullYear()
    return `${date.getDate().toString().padStart(2, '0')} ${month} ${year}`
}

export const formatTime = (minuteOrDateString: number | string) => {
    if (typeof minuteOrDateString === 'number') {
        return Math.floor(minuteOrDateString / 60).toString().padStart(2, '0') + ':' + (minuteOrDateString % 60).toString().padStart(2, '0')
    } else {
        const date = new Date(minuteOrDateString)
        return  `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
}

export const momentDateTime = (timestamp: number | string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
        return `hari ini, ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
    }
    if (isYesterday(date)) {
        return `kemarin, ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
    }
    return `${padZero(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}, ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

export const momentElapsedTime = (timestamp: number | string) => {
    const diff = Date.now() - ((typeof timestamp === 'number') ? timestamp : new Date(timestamp).getTime())
    if (diff < 60000) {
        return 'baru saja'
    } else if (diff < 3600000) {
        return `${Math.floor(diff/60000)} menit yang lalu`
    } else if (diff < 86400000) {
        return `${Math.floor(diff/3600000)} jam yang lalu`
    } else {
        return `${Math.floor(diff/86400000)} hari yang lalu`
    }
}

export const getPrecision = (value: number) => {
    if (value > 10) {
        return 1
    } else if (value > 0.1) {
        return 2
    } else if (value > 0.001) {
        return 3
    } else {
        return 4
    }
}
