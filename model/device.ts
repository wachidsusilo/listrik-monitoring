
export interface Device {
    online: boolean
    lastOnline: number
    lastUpdate: number
}

export const isDevice = (obj: any) => {
    return obj && typeof obj === 'object' && !Array.isArray(obj)
        && typeof obj.online === 'boolean'
        && typeof obj.lastOnline === 'number'
        && typeof obj.lastUpdate === 'number'
}
