"use client"
import { useAuthStore } from '@/stores/authStore/authStore'
import { Loader } from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { FiCopy } from 'react-icons/fi'  // Importing the copy icon from react-icons

const CreateRoom = () => {
    const { createRoom, roomId, isCreatingRoom, joinRoom } = useAuthStore()
    const [copied, setCopied] = useState(false)
    const [formData, setFormData] = useState({
        slug: "",
        name: ""
    })

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }))
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        createRoom(formData)
    }

    const copyToClipboard = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2*1000)
        }
    }

    function handleJoinRoom(){
        joinRoom(roomId)
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center text-white ">
            <div className={` ${!isCreatingRoom ? "bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)]" : "opacity-40" }  p-10 rounded-2xl shadow-lg shadow-gray-800 max-w-lg w-full z-10`}>
                <h1 className="text-2xl font-bold text-center mb-6">Create a Room</h1>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Room Slug..."
                        className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onChange={onChangeHandler}
                        value={formData.slug}
                        name="slug"
                    />
                    <input
                        type="text"
                        placeholder="Enter Room Name..."
                        className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onChange={onChangeHandler}
                        value={formData.name}
                        name="name"
                    />
                    <button
                        type="submit"
                        className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-lg"
                    >
                        Create Room
                    </button>
                </form>
            </div>

            {copied && <div className='fixed top-6 w-screen flex justify-center'>
                    <div className='bg-gray-700 text-white px-6 py-3 text-md rounded-lg'>Copied to Clipboard 🎉</div>
            </div>}

            {isCreatingRoom && <div className='z-50 relative bottom-56'>
                <div className=' flex flex-col items-center justify-start bg-gray-700 rounded-lg h-24 w-56'>
                    <div className=' text-white px-6 py-3 text-md '>Creating a new room</div>
                    <div >
                        <Loader className='animate-spin' />
                    </div>
                </div>    
            </div>}

            {/* Show room ID and Join Room Button if a room is created */}
            {roomId && (
                <div className="bg-gray-700 p-6 rounded-xl mt-6 text-center relative">
                    <h2 className="text-lg font-semibold">Room Created Successfully!</h2>
                    <div className="flex justify-center items-center gap-3">
                        <h3 className="text-blue-400 font-bold text-xl mt-2">{roomId}</h3>
                        <button
                            className="hover:text-white hover:scale-105 relative top-1 text-gray-400 text-xl"
                            onClick={copyToClipboard}
                        >
                            <FiCopy />
                        </button>
                    </div>
                    <Link href={`/canvas/${roomId}`}>
                        <button className="mt-4 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300" onClick={handleJoinRoom} >
                            Join Room
                        </button>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default CreateRoom
