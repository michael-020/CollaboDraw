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
    <div>
       <div className="h-screen flex flex-col gap-3 items-center justify-center">
            <form className="flex flex-col border px-6 py-8 gap-3 items-center rounded-xl">
                <h1 className="text-lg relative bottom-4 text-white ">Join room</h1>
                <input type="text" placeholder="RoomId..." className="bg-blue-200 border px-2 py-1 rounded-md placeholder:text-gray-500 " onChange={onChangeHandler} value={formData.roomId} name="roomId" />
                <Link href={`/canvas/${formData.roomId}`} className='w-full'>
                    <button className="bg-blue-500 w-full py-1 rounded-md" onClick={handleSubmit} >Submit</button>
                </Link>
            </form>
           
        </div>  
    </div>
  )
}

export default JoinRoom