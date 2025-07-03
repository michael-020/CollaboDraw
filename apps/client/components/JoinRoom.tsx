"use client"
import { useAuthStore } from '@/stores/authStore/authStore'
import { Loader } from 'lucide-react'
import React, { ChangeEvent, useEffect, useState } from 'react'
import {useRouter} from "next/navigation"

const JoinRoom = () => {
    const { joinRoom, isJoiningRoom } = useAuthStore()
    const [formData, setFormData] = useState({
        roomId: "",
    })
    const router = useRouter()

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await joinRoom(formData.roomId)
        router.push(`/canvas/${formData.roomId}`)
    }

    useEffect(() => {}, [router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white px-2">
            <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)] p-4 sm:p-8 rounded-2xl shadow-lg shadow-gray-800 z-10 ${isJoiningRoom ? "opacity-40" : ""}`}>
                <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Join a Room</h1>
                <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Room ID..."
                        className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        onChange={onChangeHandler}
                        value={formData.roomId}
                        name="roomId"
                    />
                    <button
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-base sm:text-lg"
                    >
                        Join Room
                    </button>
                </form>
            </div>

            {isJoiningRoom && <div className='z-50 fixed inset-0 flex items-center justify-center'>
                <div className='flex flex-col items-center justify-start bg-gray-700 rounded-lg h-24 w-56'>
                    <div className='text-white px-6 py-3 text-md'>Joining a room...</div>
                    <div>
                        <Loader className='animate-spin' />
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default JoinRoom
