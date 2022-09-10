import useRelay from '../../hooks/UseRelay'
import Switch from '../Switch'
import ClockField from '../ClockField'
import useAuth from '../../hooks/UseAuth'
import useFirebase from '../../hooks/UseFirebase'
import { RelayType } from '../../model/relay'
import { formatTime } from '../../utility/utils'

interface Props {
    className?: string
    relayType?: RelayType
}

const ControllerRow = ({className = '', relayType='relay1'}: Props) => {
    const relay = useRelay()
    const {connected} = useFirebase()
    const {user} = useAuth()

    const gridCols = 'grid-cols-[minmax(100px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)]'

    return (
        <tr className={`relative grid overflow-hidden [&>span]:last:hidden ${gridCols} ${className}`}>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                {relay[relayType].name}
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <ClockField
                    value={formatTime(relay[relayType].on)}
                    disabled={!connected || !user}
                    onChange={(hour, minute) => {
                            relay.setRelayOn(relayType, hour * 60 + minute)
                    }} />
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <ClockField
                    value={formatTime(relay[relayType].off)}
                    disabled={!connected || !user}
                    onChange={(hour, minute) => {
                        relay.setRelayOff(relayType, hour * 60 + minute)
                    }} />
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <Switch
                    checked={relay[relayType].auto}
                    disabled={!connected || !user}
                    onChanged={(checked) => {
                        relay.setRelayMode(relayType, checked)
                    }} />
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <Switch
                    checked={relay[relayType].state}
                    disabled={!connected || !user || relay[relayType].auto}
                    onChanged={(checked) => {
                        relay.setRelayState(relayType, checked)
                    }} />
            </td>
            <td className='w-[calc(100%-2rem)] absolute left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-200'></td>
        </tr>
    )
}

export default ControllerRow