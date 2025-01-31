import { useAuthStore } from '@/stores/authStore/authStore'
import React, { useEffect } from 'react'

const UsersInRoom = ({roomId}: {roomId: string}) => {
    const {usersInRoom, getUsers} = useAuthStore()

    useEffect(() => {
        getUsers(roomId)
    }, [getUsers])

  return (
    <div><div className='fixed right-4 flex gap-2 top-2'>{usersInRoom.map(user => (
        <div key={user.id} className='relative flex flex-col  items-center'>
            <div className='border w-10 h-10 bg-blue-400 text-black rounded-full flex items-center justify-center hover:cursor-pointer'>
                <div>{user.name[0].toUpperCase()}</div>
            </div>
            <div className='absolute top-10 text-xs'>
                {user.name}
            </div>
        </div>
    ))}</div></div>
  )
}

export default UsersInRoom