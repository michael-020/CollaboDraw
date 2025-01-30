"use client"
import { useAuthStore } from "@/stores/authStore/authStore"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"


export default function(){
    const { login, authUser } = useAuthStore()
    const [formData, setFormData] = useState({
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

        login(formData)
    }

    useEffect(() => {
        if(authUser){
            router.replace("/")
        }
        else {
            router.replace("/signin")
        }
    }, [authUser])
    

    return <div>
        <div className="h-screen flex items-center justify-center">
            <form className="flex flex-col border px-6 py-8 gap-3 items-center rounded-xl">
                <h1 className="text-lg relative bottom-4 text-white ">Sign-in</h1>
                <input type="text" placeholder="Email..." className="bg-blue-200 border px-2 py-1 rounded-md" onChange={onChangeHandler} value={formData.email} name="email" />
                <input type="text" placeholder="Password..." className="bg-blue-200 border px-2 py-1 rounded-md" onChange={onChangeHandler} value={formData.password} name="password" />
                <button className="bg-blue-500 w-full py-1 rounded-md" onClick={handleSubmit} >Submit</button>
            </form>
        </div>
    </div>
}