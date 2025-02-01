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

    useEffect(() => {

    }, [router])

    return (
        <div className="h-screen flex flex-col items-center justify-center text-white ">
            <div className={` ${!isJoiningRoom ? "bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)]" : "opacity-40" } p-10 rounded-2xl shadow-lg shadow-gray-800 max-w-lg w-full z-10`}>
                <h1 className="text-2xl font-bold text-center mb-6">Join a Room</h1>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Room ID..."
                        className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onChange={onChangeHandler}
                        value={formData.roomId}
                        name="roomId"
                    />
                    <button
                        type="submit"
                        className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-lg"
                    >
                        Join Room
                    </button>
                </form>
            </div>

            {isJoiningRoom && <div className='z-50 relative bottom-56'>
                <div className=' flex flex-col items-center justify-start bg-gray-700 rounded-lg h-24 w-56'>
                    <div className=' text-white px-6 py-3 text-md '>Joining a room...</div>
                    <div >
                        <Loader className='animate-spin' />
                    </div>
                </div>    
            </div>}
        </div>
    )
}

export default JoinRoom
