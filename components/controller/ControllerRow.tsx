import useRelay from '../../hooks/UseRelay'
import Switch from '../Switch'
import ClockField from '../ClockField'
import useAuth from '../../hooks/UseAuth'
import useFirebase from '../../hooks/UseFirebase'
import { formatTime, momentElapsedTime } from '../../utility/utils'
import useDevice from '../../hooks/UseDevice'
import useSensor from '../../hooks/UseSensor'
import NameField from '../NameField'

interface Props {
    className?: string
    deviceId?: string
}

const ControllerRow = ({className = '', deviceId = 'device1'}: Props) => {
    const {setDeviceName, getDeviceName, deviceData} = useDevice()
    const {relayData, setRelayOn, setRelayOff, setRelayMode, setRelayState} = useRelay()
    const {sensorData} = useSensor()
    const {connected} = useFirebase()
    const {user} = useAuth()

    const gridCols = 'grid-cols-[minmax(100px,1fr)_minmax(120px,1fr)_minmax(150px,1fr)_minmax(100px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)]'

    if (!relayData[deviceId]) {
        return (
            <tr className={`relative grid overflow-hidden [&>.line]:last:hidden ${gridCols} ${className}`}>
                <td className="w-full h-[60px] flex items-center justify-center text-gray-400 select-none">
                    {deviceId}
                </td>
                <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                    <NameField
                        value={getDeviceName(deviceId)}
                        disabled={!connected || !user}
                        onChange={(name) => {
                            setDeviceName(deviceId, name)
                        }}/>
                </td>
                <td className="w-full h-[60px] flex items-center justify-center text-gray-400 select-none">
                    <div
                        className={`w-2 h-2 shrink-0 rounded-full ${deviceData[deviceId].online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="ml-2 text-ellipsis text-[15px] whitespace-nowrap overflow-hidden">
                        {momentElapsedTime(deviceData[deviceId].lastOnline)}
                    </div>
                </td>
                <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                    <div
                        className="w-6 h-6 border-[2px] border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </td>
                <td className="line absolute w-[calc(100%-2rem)] left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-200"></td>
            </tr>
        )
    }

    return (
        <tr className={`relative grid overflow-hidden [&>.line]:last:hidden ${gridCols} ${className}`}>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-400 select-none">
                {deviceId}
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <NameField
                    value={getDeviceName(deviceId)}
                    disabled={!connected || !user}
                    onChange={(name) => {
                        setDeviceName(deviceId, name)
                    }}/>
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-400 select-none">
                <div
                    className={`w-2 h-2 shrink-0 rounded-full ${deviceData[deviceId].online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="ml-2 text-ellipsis text-[15px] whitespace-nowrap overflow-hidden">
                    {momentElapsedTime(deviceData[deviceId].lastOnline)}
                </div>
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <div
                    className={`${relayData[deviceId].state && sensorData[deviceId].power < 5 ? 'text-red-500 font-medium' : 'text-gray-500 font-normal'}`}>
                    {(Date.now() - deviceData[deviceId].lastUpdate > 60000 && relayData[deviceId].state) ? sensorData[deviceId].power >= 5 ? 'Normal' : 'Rusak' : '-'}
                </div>
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <ClockField
                    value={formatTime(relayData[deviceId].on)}
                    disabled={!connected || !user}
                    onChange={(hour, minute) => {
                        setRelayOn(deviceId, hour * 60 + minute)
                    }}/>
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <ClockField
                    value={formatTime(relayData[deviceId].off)}
                    disabled={!connected || !user}
                    onChange={(hour, minute) => {
                        setRelayOff(deviceId, hour * 60 + minute)
                    }}/>
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <Switch
                    checked={relayData[deviceId].auto}
                    disabled={!connected || !user}
                    onChanged={(checked) => {
                        setRelayMode(deviceId, checked)
                    }}/>
            </td>
            <td className="w-full h-[60px] flex items-center justify-center text-gray-600 select-none">
                <Switch
                    checked={relayData[deviceId].state}
                    disabled={!connected || !user || relayData[deviceId].auto}
                    onChanged={(checked) => {
                        setRelayState(deviceId, checked)
                    }}/>
            </td>
            <td className="line absolute w-[calc(100%-2rem)] left-1/2 bottom-0 -translate-x-1/2 border-b border-gray-200"></td>
        </tr>
    )
}

export default ControllerRow