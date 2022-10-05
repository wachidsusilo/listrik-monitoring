
export interface Relay {
    on: number
    off: number
    auto: boolean
    state: boolean
}

export interface RelayData {
    [key: string]: Relay
}

export const isRelay = (obj: any): obj is Relay => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && typeof obj.on === 'number'
        && typeof obj.off === 'number'
        && typeof obj.auto === 'boolean'
        && typeof obj.state === 'boolean'
}

export const isRelayData = (obj: any): obj is RelayData => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && Object.values(obj).every(value => isRelay(value))
}
