import { Trash2 } from 'lucide-react'
import React from 'react'

const DeleteRoom = () => {
  
  const deleteRoomHandler = () => {

  }  

  return (
    <div className='fixed top-3 left-12'>
        <div className='text-red-500/90'>
            <button onClick={deleteRoomHandler}>
                <Trash2 />
            </button>
        </div>
    </div>
  )
}

export default DeleteRoom