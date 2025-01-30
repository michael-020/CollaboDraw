"use client"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore/authStore"
import { useEffect } from "react"


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
    <div className="flex flex-col">
      {/* <button className="bg-blue-200 w-24" onClick={() => logout()}>Logout</button> */}
      this is home page
    </div>
  );
}
