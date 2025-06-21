import { useAuthStore } from '@/stores/authStore/authStore'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const LeaveRoomModal = () => {
    const { changeModalVisibility} = useAuthStore()
    const router = useRouter()
    const leaveRoomHandler = () => {

        router.replace("/home-page")
        changeModalVisibility()
    } 
  return (
    <div className='absolute top-1/3 left-[42%]'>
        <div className='flex z-50 h-full '>
            <div className='bg-gray-700 h-44 w-64 flex flex-col items-center justify-evenly rounded-lg relative '>
                <X  className='absolute top-2 left-2 cursor-pointer' onClick={changeModalVisibility} />
                <div className='text-center'>
                    <h2 className='text-2xl'>Exit Room</h2>
                    <h3 className='text-md text-white/60'>Are you Sure?</h3>
                </div>
                <div className='flex gap-4'>
                    <button 
                        onClick={leaveRoomHandler} 
                        className="bg-blue-700 text-white w-16 py-2 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300"
                    >
                        Yes
                    </button>
                    <button
                        className="bg-white text-blue-600 w-16 py-2 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300"
                        onClick={changeModalVisibility}
                    >
                        No
                    </button>
                </div>
            </div>
      </div>
    </div>
  )
}

export default LeaveRoomModal