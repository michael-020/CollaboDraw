"use client"
import { useAuthStore } from "@/stores/authStore/authStore"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"

export default function(){
    const { signup, authUser } = useAuthStore()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const router = useRouter()

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }))
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        signup(formData)
    }

    useEffect(() => {
        if(authUser){
            router.replace("/home-page")
        }
       
    }, [authUser])
    

    return <div>
        <div className="h-screen flex items-center justify-center">
            <form className="flex flex-col border px-6 py-8 gap-3 items-center rounded-xl">
                <h1 className="text-lg relative bottom-4 text-white ">Sign-up</h1>
                <input type="text" placeholder="Email..." className="bg-blue-200 border px-2 py-1 rounded-md" onChange={onChangeHandler} value={formData.email} name="email" />
                <input type="text" placeholder="Name..." className="bg-blue-200 border px-2 py-1 rounded-md" onChange={onChangeHandler} value={formData.name} name="name" />
                <input type="text" placeholder="Password..." className="bg-blue-200 border px-2 py-1 rounded-md" onChange={onChangeHandler} value={formData.password} name="password" />
                <button className="bg-blue-500 w-full py-1 rounded-md" onClick={handleSubmit} >Submit</button>
            </form>
        </div>
    </div>
}