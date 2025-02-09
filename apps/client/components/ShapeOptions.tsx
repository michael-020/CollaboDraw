import React from 'react'
import { CaseSensitive, Circle, Minus, MousePointer, MoveLeft, Pencil, Square } from 'lucide-react'
import { Tool } from './Canvas'
import { IconButton } from './IconButton'
import { useAuthStore } from '@/stores/authStore/authStore'

export const ShapeOptions = ({selectedTool, setSelectedTool}: {selectedTool: Tool, setSelectedTool: (s: Tool) => void}) => {
    const {isModalVisible} = useAuthStore()
  return (
    <div className={`w-screen flex justify-center ${isModalVisible ? "opacity-30": ""}`}>
        <div className='z-50 fixed top-3 px-2 flex gap-1 items-center bg-gray-100/30 backdrop-blur-sm rounded-md '>
            <IconButton icon={<MousePointer className='size-[1.4rem] mt-1' />} activated={selectedTool === "CURSOR"} onClick={() => {
                setSelectedTool("CURSOR")
            }} />
            <IconButton icon={<Square  />} activated={selectedTool === "RECTANGLE"} onClick={() => {
                setSelectedTool("RECTANGLE")
            }} />
            <IconButton icon={<Circle />} isCircle={true} activated={selectedTool === "CIRCLE"} onClick={() => {
                setSelectedTool("CIRCLE")
            }} />
            <IconButton icon={<Minus className='p-1 size-8 hover:scale-110' />}  isCircle={true} activated={selectedTool === "LINE" } onClick={() => {
                setSelectedTool("LINE")
            }} />
            <IconButton icon={<MoveLeft className='p-1 size-7 hover:scale-110' />}  isCircle={false} activated={selectedTool === "ARROW" } onClick={() => {
                setSelectedTool("ARROW")
            }} />
            <IconButton icon={<Pencil className='p-1 hover:scale-110' />}  isCircle={false} activated={selectedTool === "PENCIL" } onClick={() => {
                setSelectedTool("PENCIL")
            }} />
             <IconButton icon={<CaseSensitive className='p-1 size-9 hover:scale-105' />}  isCircle={false} activated={selectedTool === "TEXT" } onClick={() => {
                setSelectedTool("TEXT")
            }} />
        </div>
    </div>
    
  )
}
