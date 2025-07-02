"use client"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore/authStore"
import { useEffect } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { logout, authUser, checkAuth, isLoggingOut } = useAuthStore();
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
      <div className="flex absolute top-6 right-6 gap-3">
        <button 
          onClick={() => router.push("/rooms")} 
          className="px-4 py-2 rounded-md text-white bg-neutral-700 font-semibold border border-gray-50 transition hover:bg-neutral-600 "
        >
          Rooms
        </button>
        <button 
          onClick={logout}
          disabled={isLoggingOut}
          className="px-4 py-2 rounded-md text-white font-semibold border border-gray-50 transition hover:bg-gray-700 flex items-center justify-center min-w-[90px]"
        >
          {isLoggingOut ? (
            <Loader2 className="animate-spin size-5 mr-2" />
          ) : null}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

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
          <button className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300">
            Create Room
          </button>
        </Link>
        <Link href={"/join-room"}>
          <button className="bg-white text-emerald-400 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300">
            Join Room
          </button>
        </Link>
      </div>
    </div>
  );
}