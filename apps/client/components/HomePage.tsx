"use client"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore/authStore"
import { useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const { logout, authUser, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth, logout])

  useEffect(() => {
    if (!authUser) {
      router.replace("/"); 
    }

  }, [authUser, router]);

  
  return (
    <div className="h-screen flex flex-col items-center justify-center text-white p-6 relative">
      
      {/* Logout Button */}
      <button 
        onClick={logout} 
        className="absolute top-6 right-6  px-4 py-2 rounded-md text-white font-semibold border border-gray-50 transition hover:bg-gray-700 "
      >
        Logout
      </button>

      {/* Heading */}
      <h1 className="text-4xl font-bold mb-6 text-center">
        Welcome to CollaboDraw!
      </h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Create a room or join an existing one to start collaborating.
      </p>

      {/* Buttons */}
      <div className="flex space-x-6">
        <Link href={"/create-room"}>
          <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300">
            Create Room
          </button>
        </Link>
        <Link href={"/join-room"}>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300">
            Join Room
          </button>
        </Link>
      </div>
    </div>
  );
}