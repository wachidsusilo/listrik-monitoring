
const sensorTypes = ['sensor1', 'sensor2', 'sensor3', 'sensor4'] as const
export type SensorType = typeof sensorTypes[number]

export interface SensorValue {
    energy: number
    power: number
}

export type SensorValueData = {
    [key in SensorType]: SensorValue
}

export interface SensorTotalData {
    dateTime: string
    total: SensorValue
}

export type ExtendedSensorValueData = SensorValueData & SensorTotalData

export interface Sensor extends SensorValue {
    name: string
}

export type SensorData = {
    [key in SensorType]: Sensor
}

export const isSensorValue = (obj: any): obj is SensorValue => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && typeof obj.energy === 'number'
        && typeof obj.power === 'number'
}

export const isSensor = (obj: any): obj is Sensor => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && typeof obj.name === 'string'
        && typeof obj.energy === 'number'
        && typeof obj.power === 'number'
}

export const isSensorData = (obj: any): obj is SensorData => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && sensorTypes.every(value => obj.hasOwnProperty(value) && isSensor(obj[value]))
}

export const isSensorValueData = (obj: any): obj is SensorValueData => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && sensorTypes.every(value => obj.hasOwnProperty(value) && isSensorValue(obj[value]))
}

export const isSensorTotalData = (obj: any): obj is SensorData => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && typeof obj.dateTime === 'string'
        && isSensorValue(obj.total)
}

export const isSensorEqual = (sensor1: Sensor, sensor2: Sensor) => {
    return sensor1.name === sensor2.name
        && sensor1.energy === sensor2.energy
        && sensor1.power === sensor2.power
}
