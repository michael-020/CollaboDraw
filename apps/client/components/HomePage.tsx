"use client"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore/authStore"
import { useEffect } from "react"
import Link from "next/link"


export default function HomePage() {
  const { authUser, checkAuth, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth, logout])

  
  useEffect(() => {
    if (!authUser) {
      router.replace("/signin"); 
    }
  }, [authUser, router]);

  if (!authUser) {
    return <div>
        You are not logged in
    </div>; 
  }
  
  return (
    <div className="">
      {/* <button className="bg-blue-200 w-24" onClick={() => logout()}>Logout</button> */}
      this is home page
      <div className="h-screen flex items-center justify-center">
        <Link href={"/create-room"} >
          <button className="bg-blue-200 px-4 py-2 rounded-md">Go to create Room</button>
        </Link>
      </div>
    </div>
  );
}
