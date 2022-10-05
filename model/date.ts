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

export const getPeriodList = (until: PeriodType) => {
    const types = periodTypes.map(v => v).slice(0, periodTypes.indexOf(until) + 1)
    return types.map(value => {
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

const exportTypes = ['yearly', 'monthly', 'daily', 'hourly', 'minutely', 'none'] as const
export type ExportType = typeof exportTypes[number]

export const translateExportType = (type: ExportType) => {
    switch (type) {
        case 'yearly':
            return 'Tahunan'
        case 'monthly':
            return 'Bulanan'
        case 'daily':
            return 'Harian'
        case 'hourly':
            return 'Per jam'
        case 'minutely':
            return 'Per menit'
        default:
            return '-'
    }
}

export const getExportTypeList = (from: ExportType, to: ExportType) => {
    const types = exportTypes.map(v => v).slice(exportTypes.indexOf(from), exportTypes.indexOf(to) + 1)
    return types.map(v => translateExportType(v))
}

export const toExportType = (type: String): ExportType => {
    switch (type) {
        case 'Tahunan':
            return 'yearly'
        case 'Bulanan':
            return 'monthly'
        case 'Harian':
            return 'daily'
        case 'Per jam':
            return 'hourly'
        case 'Per menit':
            return 'minutely'
        default:
            return 'none'
    }
}