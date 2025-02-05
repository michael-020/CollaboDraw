"use client"
import { useAuthStore } from "@/stores/authStore/authStore"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"  // Importing the eye icons from react-icons

export default function Signin(){
    const { login } = useAuthStore()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value
        }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        await login(formData)

        router.push("/home-page")
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    // useEffect(() => {
    //     if(authUser){
    //         router.replace("/home-page")
    //     }
    //     else {
    //         router.replace("/signin")
    //     }
    // }, [authUser, router])
    

    return (
        <div className="h-screen flex flex-col items-center justify-center text-white ">
            <div className="bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)] p-10 rounded-2xl shadow-lg shadow-gray-800 max-w-lg w-full">
                <h1 className="text-2xl font-bold text-center mb-6">Sign-in</h1>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-lg">Email</label>
                        <input
                            type="email"
                            placeholder="Enter Email..."
                            className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onChange={onChangeHandler}
                            value={formData.email}
                            name="email"
                            id="email"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="password" className="text-lg">Password</label>
                        <div className="flex items-center justify-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password..."
                                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                                onChange={onChangeHandler}
                                value={formData.password}
                                name="password"
                                id="password"
                            />
                            <button 
                                type="button" 
                                className="absolute right-3 "
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <FiEyeOff className="text-gray-400 text-xl" />
                                ) : (
                                    <FiEye className="text-gray-400 text-xl" />
                                )}
                            </button>
                        </div>
                       
                    </div>
                    
                    <button
                        type="submit"
                        className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-lg"
                    >
                        Sign-in
                    </button>
                </form>
            </div>
        </div>
    )
}
