"use client"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore/authStore"
import { useEffect } from "react"


export default function HomePage() {
  const { authUser, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  
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
    <div>
      this is home page
    </div>
  );
}
