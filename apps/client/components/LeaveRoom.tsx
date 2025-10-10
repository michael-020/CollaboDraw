import { useAuthStore } from '@/stores/authStore/authStore'
import { LogOut } from 'lucide-react'
import React from 'react'
import LeaveRoomModal from './LeaveRoomModal'

interface LeaveRoomProps {
  socket: WebSocket;
  roomId: string;
}

const LeaveRoom = ({socket, roomId}: LeaveRoomProps) => {
  const { isModalVisible, changeModalVisibility} = useAuthStore()
  const leaveRoomHandler = () => {  
      changeModalVisibility()
  }  

  return (
    <div className='z-50'>  
      <div className='fixed top-2.5 right-4'>
          <div onClick={leaveRoomHandler} className='text-red-500/90 hover:bg-neutral-800 p-2 rounded-md cursor-pointer'>
              <button >
                  <LogOut className='size-5' />
              </button>
          </div>
      </div>
      {
        isModalVisible &&<LeaveRoomModal socket={socket} roomId={roomId} />
      }
      
    </div>
  )
}

export default LeaveRoom