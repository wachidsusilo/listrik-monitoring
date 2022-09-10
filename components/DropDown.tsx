import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'
import useClickAnywhere from '../hooks/UseClickAnywhere'
import { v4 as UUID } from 'uuid'

interface Props {
    className?: string
    disabled?: boolean
    selected?: string
    placeholder?: string
    label?: string
    items?: Array<string>
    onItemSelected?: (item: string) => void
}

const DropDown = (
    {
        className = '',
        disabled = false,
        selected,
        placeholder = '',
        items = [],
        label,
        onItemSelected
    }: Props
) => {
    const [selectedItem, setSelectedItem] = useState<string|undefined>(selected)
    const [open, setOpen] = useState<boolean>(false)
    const idRef = useRef<string>('')
    const {register, unregister, dispatchClick} = useClickAnywhere()

    useEffect(() => {
        idRef.current = UUID()
        register(idRef.current, () => {
            setOpen(false)
        })

        return () => {
            unregister(idRef.current)
        }
    }, [])

    useEffect(() => {
        setSelectedItem(selected)
    }, [selected])

    return (
        <div className={`relative z-10 flex flex-col gap-1 ${className}`}>
            {
                label && (
                    <div className='ml-2 text-sm text-gray-500'>{label}</div>
                )
            }
            <div
                className={`w-full h-[30px] px-3 text-gray-600 flex items-center justify-between select-none 
                rounded-[6px] shadow ${disabled ? 'bg-gray-50 cursor-default' : 'bg-white cursor-pointer'}`}
                onClick={(e) => {
                    if (disabled) {
                        return
                    }
                    e.stopPropagation()
                    setOpen(!open)
                    dispatchClick(idRef.current)
                }}>
                {selectedItem ?? placeholder}
                <ChevronDownIcon
                    className={`w-4 h-4 mt-0.5 text-gray-600 transition ${!disabled && open ? 'rotate-180' : 'rotate-0'}`}/>
            </div>
            <div className={`absolute top-[calc(100%+4px)] left-0 w-full bg-white 
            transition-[max-height,box-shadow] rounded-[6px] overflow-hidden
            ${!disabled && open ? 'max-h-[300px] shadow' : 'max-h-0 shadow-none'}`}>
                <div className="w-full max-h-[300px] overflow-y-auto scrollbar-thin-blue">
                    <ul className="w-full">
                        {
                            items?.map((value, index) => (
                                <li
                                    key={index}
                                    className="relative w-full h-[30px] px-2 flex items-center justify-center text-gray-600
                                    [&>span]:not-last:border-b border-gray-200 select-none cursor-pointer hover:bg-blue-50"
                                    onClick={() => {
                                        if (onItemSelected) {
                                            onItemSelected(value)
                                        }
                                        setOpen(false)
                                        setSelectedItem(value)
                                    }}>
                                    {value}
                                    <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)]'></span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default DropDown