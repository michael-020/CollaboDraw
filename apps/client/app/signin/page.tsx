"use client"
import { useAuthStore } from "@/stores/authStore/authStore"
import { Loader } from "lucide-react"
import { redirect, useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import Image from "next/image";

export default function Signin(){
    const { 
        login, 
        isLoggingIn, 
        handleGoogleSignin, 
        handleGoogleAuthError,
        authUser 
    } = useAuthStore()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    useEffect(() => {
        handleGoogleAuthError();
    }, [handleGoogleAuthError]);

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
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    useEffect(() => {
        if(authUser)
            redirect("/home")
    }, [authUser])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white px-2">
            <div className="bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)] p-4 sm:p-8 md:p-10 rounded-2xl shadow-lg shadow-gray-800 w-full max-w-xs sm:max-w-md md:max-w-lg">
                <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Sign-in</h1>
                <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-base sm:text-lg">Email</label>
                        <input
                            type="email"
                            placeholder="Enter Email..."
                            className="bg-neutral-900 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            onChange={onChangeHandler}
                            value={formData.email}
                            name="email"
                            id="email"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="password" className="text-base sm:text-lg">Password</label>
                        <div className="flex items-center justify-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password..."
                                className="bg-neutral-900 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full"
                                onChange={onChangeHandler}
                                value={formData.password}
                                name="password"
                                id="password"
                            />
                            <button 
                                type="button" 
                                className="absolute right-3"
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
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-base sm:text-lg"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? <Loader className="animate-spin mx-auto" />  : "Sign-in"}
                    </button>
                    <div className="text-center">
                        <p>Don&#39;t have an Account? <span onClick={() => { router.push("/verify-email") }} className="hover:underline text-emerald-400 cursor-pointer">Sign up</span></p>
                    </div>
                </form>
                {/* OR Continue With Section */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-700" />
                    <span className="px-3 text-gray-400 text-sm">Or</span>
                    <div className="flex-1 h-px bg-gray-700" />
                </div>
                <button
                    type="button"
                    onClick={handleGoogleSignin}
                    className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-white hover:bg-gray-100 transition font-semibold text-gray-800"
                >
                    <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
                    Continue with Google
                </button>
            </div>
        </div>
    )
}
