export const monthList = ['Semua', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'] as const
export const dayList = ['Semua', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'] as const

export type Year = 'Semua' | string
export type Month = typeof monthList[number]
export type Day = typeof dayList[number]

export const isMonth = (text?: string): text is Month => {
    return monthList.includes(text as Month)
}

export const isDay = (text?: string): text is Day => {
    return dayList.includes(text as Day)
}

export const indexOfMonth = (month: Month) => {
    return monthList.indexOf(month).toString().padStart(2, '0')
}

export const getMonth = (index: number): Month | undefined => {
    if (isNaN(index)) {
        return undefined
    }
    return monthList[index]
}

const periodTypes = ['today', 'yesterday', 'this-week', 'this-month', 'this-year', 'all'] as const
export type PeriodType = typeof periodTypes[number]

export const isValidPeriodType = (type: any): type is PeriodType => {
    return typeof type === 'string' && periodTypes.includes(type as PeriodType)
}

export const getPeriodList = () => {
    return periodTypes.map(value => {
        switch (value) {
            case 'today':
                return 'Hari ini'
            case 'yesterday':
                return 'Kemarin'
            case 'this-week':
                return 'Minggu ini'
            case 'this-month':
                return 'Bulan ini'
            case 'this-year':
                return 'Tahun ini'
            case 'all':
                return 'Semua'
        }
    })
}

export const toPeriodType = (type: string): PeriodType => {
    switch (type) {
        case 'Hari ini':
            return 'today'
        case 'Kemarin':
            return 'yesterday'
        case 'Minggu ini':
            return 'this-week'
        case 'Bulan ini':
            return 'this-month'
        case 'Tahun ini':
            return 'this-year'
        default:
            return 'all'
    }
}