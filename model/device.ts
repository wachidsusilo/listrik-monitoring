
export interface Device {
    name: string
    lastOnline: number
    lastUpdate: number
}

export interface ExtendedDevice extends Device{
    online: boolean
}

export interface DeviceData {
    [key: string]: Device
}

export interface ExtendedDeviceData {
    [key: string]: ExtendedDevice
}

export const isDevice = (obj: any): obj is Device => {
    return obj && typeof obj === 'object' && !Array.isArray(obj)
        && typeof obj.name === 'string'
        && typeof obj.lastOnline === 'number'
        && typeof obj.lastUpdate === 'number'
}
