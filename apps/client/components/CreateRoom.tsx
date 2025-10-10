"use client"
import { useAuthStore } from '@/stores/authStore/authStore'
import { Loader, Check, Copy } from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

const CreateRoom = () => {
    const { createRoom, roomId, isCreatingRoom, joinRoom } = useAuthStore()
    const [copied, setCopied] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const [formData, setFormData] = useState({
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

    const copyToClipboard = async () => {
        if (roomId) {
            await navigator.clipboard.writeText(roomId)
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 4000)
        }
    }

    function handleJoinRoom(){
        joinRoom(roomId)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white px-2">
            <div className={`${!isCreatingRoom ? "bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)]" : "opacity-40"} w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-8 rounded-2xl shadow-lg shadow-gray-800 z-10`}>
                <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Create a Room</h1>
                <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Room Name..."
                        className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        onChange={onChangeHandler}
                        value={formData.name}
                        name="name"
                    />
                    <button
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-base sm:text-lg"
                    >
                        Create Room
                    </button>
                </form>
            </div>

            {isCreatingRoom && <div className='z-50 fixed inset-0 flex items-center justify-center'>
                <div className='flex flex-col items-center justify-start bg-gray-700 rounded-lg h-24 w-56'>
                    <div className='text-white px-6 py-3 text-md'>Creating a new room</div>
                    <div>
                        <Loader className='animate-spin' />
                    </div>
                </div>
            </div>}

            {roomId && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                    <div ref={modalRef} className="bg-neutral-900 rounded-2xl p-8 shadow-2xl w-full max-w-md border border-emerald-700 relative">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2 text-neutral-200">Room Created</h2>
                            {/* <button
                                className="absolute top-4 right-4 curosr-pointer text-emerald-400 hover:text-white transition"
                            >
                                <X size={20} />
                            </button> */}
                            <div className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between gap-4 mb-6">
                                <span className="text-emerald-400 font-mono text-lg">{roomId}</span>
                                <button
                                    onClick={copyToClipboard}
                                    className="text-emerald-400 hover:text-emerald-300 transition p-2 rounded-md hover:bg-emerald-400/10"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-gray-400 text-md mb-6">Share this code with others to let them join your room</p>

                            <Link href={`/canvas/${roomId}`} className="block">
                                <button 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                                    onClick={handleJoinRoom}
                                >
                                    Join Room
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default CreateRoom
