import { useAuthStore } from '@/stores/authStore/authStore'
import React, { useEffect } from 'react'

const UsersInRoom = ({roomId}: {roomId: string}) => {
    const {usersInRoom, getUsers, isModalVisible} = useAuthStore()

    useEffect(() => {
        getUsers(roomId)
    }, [getUsers, roomId, usersInRoom ])

  return (
    <div className={`${isModalVisible ? "opacity-40": ""}`}><div className='fixed left-4 flex gap-2 top-2'>{usersInRoom.map(user => (
        <div key={user.id} className='relative flex flex-col  items-center'>
            <div className='border w-10 h-10 bg-blue-400 text-black rounded-full flex items-center justify-center hover:cursor-pointer'>
                <div>{user.email[0].toUpperCase()}</div>
            </div>
            <div className='absolute top-10 text-xs'>
                {user.email}
            </div>
        </div>
    ))}</div></div>
  )
}

export default UsersInRoom