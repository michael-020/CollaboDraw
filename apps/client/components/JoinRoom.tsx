"use client"
import { useAuthStore } from '@/stores/authStore/authStore'
import Link from 'next/link'
import React, { ChangeEvent, useState } from 'react'

const JoinRoom = () => {
    const { joinRoom } = useAuthStore()
    const [formData, setFormData] = useState({
        roomId: "",
    })

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }))
    }

   function handleSubmit(){
        joinRoom(formData.roomId)
   }
    
  return (
    <div className="h-screen flex flex-col items-center justify-center text-white ">
        <div className="bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)] p-10 rounded-2xl shadow-lg shadow-gray-800 max-w-lg w-full">
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
    </div>
  )
}

export default JoinRoom
