import { Menu } from 'lucide-react'
import React from 'react'

const SidebarToggle = () => {
  return (
    <div className='fixed top-4 left-4 cursor-pointer bg-purple-200 p-2 rounded-md text-black'>
        <Menu className='size-5' />
    </div>
  )
}

export default SidebarToggle