import { useAuthStore } from '@/stores/authStore/authStore'
import { LogOut } from 'lucide-react'
import React from 'react'
import LeaveRoomModal from './LeaveRoomModal'

const LeaveRoom = () => {
  const { isModalVisible, changeModalVisibility} = useAuthStore()
  const leaveRoomHandler = () => {  
      changeModalVisibility()
  }  

  return (
    <div className='z-50'>  
      <div className='fixed top-4 right-4'>
          <div className='text-red-500/90'>
              <button onClick={leaveRoomHandler}>
                  <LogOut />
              </button>
          </div>
      </div>
      {
        isModalVisible && <LeaveRoomModal />
      }
      
    </div>
  )
}

export default LeaveRoom