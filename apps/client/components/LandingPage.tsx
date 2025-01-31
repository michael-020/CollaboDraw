"use client"
import React, { useEffect } from 'react'
import Link from "next/link"
import { Users, Share2, Edit3 } from "lucide-react"
import { FeatureCard } from './FeatureCard'
import { useAuthStore } from '@/stores/authStore/authStore'
import { useRouter } from 'next/navigation'

const LandingPage = () => {
    const { authUser } = useAuthStore()
    const router = useRouter()
    useEffect(() => {
        if(authUser){

            router.replace("/home-page")
        } 
        else {

            router.replace("/")
        }
    }, [authUser])

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4">
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 bg-[radial-gradient(circle,_rgb(46,46,46)_0%,_rgb(5,5,5)_100%)] text-white p-4">
      <main className="text-center">
        <h1 className="text-5xl font-bold mb-6">CollaboDraw</h1>
        <p className="text-xl mb-8">Collaborate, Create, and Have Fun!</p>

        <div className="flex justify-center space-x-4 mb-12">
          <Link
            href="/signin"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300"
          >
            Sign Up
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard icon={<Users size={24} />} title="Create Rooms">
            Start a drawing room and invite your friends to join.
          </FeatureCard>
          <FeatureCard icon={<Share2 size={24} />} title="Share Instantly">
            Get an invite code to share with others for quick access.
          </FeatureCard>
          <FeatureCard icon={<Edit3 size={24} />} title="Draw Together">
            Collaborate in real-time and bring your ideas to life.
          </FeatureCard>
        </div>
      </main>
    </div>
  )
}

export default LandingPage