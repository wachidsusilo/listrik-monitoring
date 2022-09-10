import { ComponentType, HTMLInputTypeAttribute, useEffect, useRef, useState } from 'react'

interface Props {
    className?: string
    type?: HTMLInputTypeAttribute
    value?: string
    placeholder?: string
    icon?: ComponentType<{ className?: string }>
    onChanged?(text: string): void
    onInput?(text: string): void
    onFocus?(): void
    onBlur?(): void
    onEnter?(): void
    validator?(input: string): boolean
}

const TextField = (
    {
        className = '',
        type,
        icon: Icon,
        value,
        placeholder,
        onChanged,
        onInput,
        onFocus,
        onBlur,
        onEnter,
        validator
    }: Props
) => {
    const [error, setError] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const input = inputRef.current
        if (!input) {
            return
        }

        input.oninput = () => {
            if (onInput) {
                onInput(input.value)
            }
        }

        input.onchange = () => {
            if (onChanged) {
                onChanged(input.value)
            }
        }

        input.onfocus = () => {
            setError(false)
            if (onFocus) {
                onFocus()
            }
        }

        input.onblur = () => {
            if (validator) {
                setError(!validator(input.value))
            }
            if (onBlur) {
                onBlur()
            }
        }

        input.onkeydown = (e) => {
            if (e.key === 'Enter' && onEnter) {
                e.stopPropagation()
                onEnter()
            }
        }

    }, [value])

    return (
        <div className={`w-full h-[40px] pr-2 flex items-center bg-white rounded-[8px] shadow
            outline outline-2  ${error ? 'outline-red-500' : 'outline-none'} ${className}`}>
            {
                Icon && <Icon className="w-6 h-6 mx-3 text-gray-400"/>
            }
            <input
                ref={inputRef}
                type={type ?? 'text'}
                className="w-full h-full min-w-0 pb-[3px] active:outline-none bg-transparent
                focus:outline-none"
                spellCheck={false}
                placeholder={placeholder}/>
        </div>
    )
}

export default TextField