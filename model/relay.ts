
export const relayTypes = ['relay1', 'relay2', 'relay3', 'relay4'] as const
export type RelayType = typeof relayTypes[number]

export interface Relay {
    name: string
    on: number
    off: number
    auto: boolean
    state: boolean
}

export type RelayData = {
    [key in RelayType]: Relay
}

export const isValidRelayType = (obj: any): obj is RelayType => {
    return obj && typeof obj === 'string' && relayTypes.some(value => value === obj)
}

export const isRelay = (obj: any): obj is Relay => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && typeof obj.name === 'string'
        && typeof obj.on === 'number'
        && typeof obj.off === 'number'
        && typeof obj.auto === 'boolean'
        && typeof obj.state === 'boolean'
}

export const isRelayData = (obj: any): obj is RelayData => {
    return obj && typeof obj ==='object' && !Array.isArray(obj)
        && relayTypes.every(value => obj.hasOwnProperty(value) && isRelay(obj[value]))
}

export const isRelayEqual = (relay1: Relay, relay2: Relay) => {
    return relay1.name === relay2.name
        && relay1.on === relay2.on
        && relay1.off === relay2.off
        && relay1.auto === relay2.auto
        && relay1.state === relay2.state
}
