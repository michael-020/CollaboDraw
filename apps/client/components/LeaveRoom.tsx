import { LogOut } from 'lucide-react'
import React from 'react'

const LeaveRoom = () => {
  
  const leaveRoomHandler = () => {

  }  

  return (
    <div className='fixed top-2 left-4'>
        <div className='rotate-180 text-red-500/90'>
            <button onClick={leaveRoomHandler}>
                <LogOut />
            </button>
        </div>
    </div>
  )
}

export default LeaveRoom