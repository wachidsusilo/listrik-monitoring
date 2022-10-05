import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import TextField from '../TextField'
import { useEffect, useRef, useState } from 'react'
import useAuth from '../../hooks/UseAuth'
import { useRouter } from 'next/router'

const validateEmail = (email: string) => {
    return /^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/gm.test(email)
}

const LoginContent = () => {
    const [error, setError] = useState<string|null>(null)
    const [disabled, setDisabled] = useState<boolean>(true)
    const credential = useRef({email: '', password: ''})
    const {signIn, loading, user, error: authError} = useAuth()
    const {push, query} = useRouter()

    useEffect(() => {
        setError(authError)
    }, [authError])

    if (user) {
        if (query && typeof query.origin === 'string') {
            push(query.origin).then()
        } else {
            push('/').then()
        }
        return null
    }

    return (
        <div className='w-full h-full flex justify-center overflow-hidden'>
            <div className='w-full max-w-[400px] mt-32 px-8 flex flex-col items-center'>
                <h1 className='text-lg text-gray-600 font-bold'>LOGIN</h1>
                <TextField
                    className='mt-12'
                    type='email'
                    placeholder='Email'
                    onChanged={(email) => credential.current.email = email}
                    onInput={(email) => {
                        setDisabled(!validateEmail(email))
                    }}
                    onFocus={() => {
                        setError(null)
                    }}
                    onEnter={() => {
                        if (loading || !validateEmail(credential.current.email)) {
                            return
                        }
                        signIn(credential.current.email, credential.current.password)
                    }}
                    onBlur={() => {
                        if (!validateEmail(credential.current.email)) {
                            setError('Email tidak valid')
                        }
                    }}
                    icon={EnvelopeIcon}
                    validator={validateEmail} />
                <TextField
                    className='mt-4'
                    type='password'
                    placeholder='Password'
                    onChanged={(password) => credential.current.password = password}
                    onEnter={() => {
                        if (loading || !validateEmail(credential.current.email)) {
                            return
                        }
                        signIn(credential.current.email, credential.current.password)
                    }}
                    icon={LockClosedIcon} />
                {
                    error &&
                    <div className='w-full'>
                        <p className='mt-4 text-red-500 text-sm'>{error}</p>
                    </div>
                }
                <button
                    className={`w-full h-[40px] mt-8 flex items-center justify-center text-white rounded-[8px] 
                    font-medium transition bg-blue-500 disabled:bg-gray-400 disabled:active:scale-100
                    ${loading ? 'active:scale-100' : 'active:scale-95'}`}
                    disabled={disabled}
                    onClick={() => {
                        if (loading || !validateEmail(credential.current.email)) {
                            return
                        }
                        signIn(credential.current.email, credential.current.password)
                    }}>
                    {
                        loading ?
                            <span className='w-[18px] h-[18px] border-[2px] border-t-transparent border-white
                            rounded-full animate-spin'></span>
                            :
                            'Login'
                    }
                </button>
            </div>
        </div>
    )
}

export default LoginContent