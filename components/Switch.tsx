import { useEffect, useState } from 'react'

interface Props {
    className?: string
    disabled?: boolean
    checked?: boolean
    onChanged?: (checked: boolean) => void
}

const Switch = ({className='', disabled=false, checked=false, onChanged}: Props) => {
    const [isChecked, setIsChecked] = useState<boolean>(checked)

    useEffect(() => {
        setIsChecked(checked)
    }, [checked])

    return (
        <div
            className={`relative w-[52px] h-[26px] rounded-[6px] transition
             ${disabled ? 'cursor-default' : 'cursor-pointer'} 
             ${disabled ? isChecked ? 'bg-green-200' : 'bg-gray-200' : isChecked ? 'bg-green-500' : 'bg-gray-300'} ${className}`}
            onClick={() => {
                if (disabled) {
                    return
                }
                if (onChanged) {
                    onChanged(!isChecked)
                }
                setIsChecked(!isChecked)
            }}>
            <span className={`absolute left-[2px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center gap-[4px] 
                justify-center bg-white rounded-[6px] shadow-md transition ${isChecked ? 'translate-x-[26px]' : 'translate-x-0'}`}>
                <span className='w-[1px] h-[12px] bg-gray-300'></span>
                <span className='w-[1px] h-[12px] bg-gray-300'></span>
                <span className='w-[1px] h-[12px] bg-gray-300'></span>
            </span>
        </div>
    )
}

export default Switch