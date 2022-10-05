
export interface Sensor {
    energy: number
    power: number
}

export interface SensorData {
    [key: string]: Sensor
}

export interface SensorTotalData {
    dateTime: string
    total: Sensor
}

export interface ExtendedSensorData extends SensorTotalData {
    data: SensorData
}

export const isSensor = (obj: any): obj is Sensor => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && typeof obj.energy === 'number'
        && typeof obj.power === 'number'
}

export const isSensorData = (obj: any): obj is SensorData => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && Object.values(obj).every(value => isSensor(value))
}
