"use client"
import { useAuthStore } from '@/stores/authStore/authStore'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useState } from 'react'

const CreateRoom = () => {
    const {createRoom, roomId} = useAuthStore()
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
    
       
  return (
    <div>
       <div className="h-screen flex flex-col gap-3 items-center justify-center">
            <form className="flex flex-col border px-6 py-8 gap-3 items-center rounded-xl">
                <h1 className="text-lg relative bottom-4 text-white ">Create room</h1>
                <input type="text" placeholder="Slug..." className="bg-blue-200 border px-2 py-1 rounded-md placeholder:text-gray-500 " onChange={onChangeHandler} value={formData.slug} name="slug" />
                <input type="text" placeholder="Name..." className="bg-blue-200 border px-2 py-1 rounded-md placeholder:text-gray-500" onChange={onChangeHandler} value={formData.name} name="name" />
                <button className="bg-blue-500 w-full py-1 rounded-md" onClick={handleSubmit} >Submit</button>
            </form>
            <div className='bg-gray-300 '>

                {roomId && <div>
                        <Link href={`/canvas/${roomId}`}>
                            <button>Join room</button>
                        </Link>
                        <h2 className='text-lg'>{roomId}</h2>
                    </div>
                }
            </div>
        </div>  
    </div>
  )
}

export default CreateRoom