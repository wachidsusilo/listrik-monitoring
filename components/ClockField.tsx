import { useEffect, useRef, useState } from 'react'

interface Props {
    className?: string
    value?: string
    disabled?: boolean
    onChange?: (hour: number, minute: number) => void
}

const regex = new RegExp('^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$')

const isValidTime = (text: string) => {
    return regex.test(text)
}

const ClockField = ({className = '', value = '', disabled = false, onChange}: Props) => {
    const [error, setError] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const input = inputRef.current
        if (!input) {
            return
        }
        input.value = value
    }, [inputRef.current, value])

    useEffect(() => {
        const input = inputRef.current
        if (!input) {
            return
        }

        input.oninput = () => {
            setError(!isValidTime(input.value))
        }

        input.onchange = () => {
            if(onChange && isValidTime(input.value)) {
                const list = input.value.split(':').map(value => Number.parseInt(value))
                if (list.length === 2) {
                    onChange(list[0], list[1])
                }
            }
        }

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                input.blur()
            }
        }
    }, [inputRef.current])

    return (
        <div className={`w-full max-w-[100px] h-[25px] mx-2 flex outline-none focus-within:outline-blue-500/80 rounded-[8px] ${error ? '!outline-red-500' : ''} ${className}`}>
            <input
                ref={inputRef}
                type="text"
                disabled={disabled}
                className={`w-full h-full grow min-w-0 bg-transparent active:outline-none text-center focus:outline-none text-gray-600
                ${disabled ? 'pointer-events-none' : 'pointer-events-auto'}`}/>
        </div>
    )
}

export default ClockField