"use client"
import React, { CanvasHTMLAttributes, useEffect, useRef, useState } from 'react'
import { ShapeOptions } from './ShapeOptions'
import UsersInRoom from './UsersInRoom'
import LeaveRoom from './LeaveRoom'
import { useAuthStore } from '@/stores/authStore/authStore'
import { Tool, useDraw } from '@/hooks/useDraw'
import Filterbar from './Filterbar'
import { DrawShapes } from '@/app/draw/drawShape'
import SidebarToggle from './SidebarToggle'
// import UndoAndRedo from './UndoAndRedo'

// export type Tool = "CIRCLE" | "RECTANGLE" | "LINE" | "ARROW" | "PENCIL" | "TEXT" | "CURSOR"

// const Canvas = ({roomId, socket}: {roomId: string, socket: WebSocket}) => {
//     const { isModalVisible } = useAuthStore()
//     const canvasRef = useRef<HTMLCanvasElement>(null)  
//     const gameRef = useRef<Game | null>(null)
//     const [selectedTool, setSelectedTool] = useState<Tool | "">("")
//     const [showTextArea, setShowTextArea] = useState(false)
//     const [textAreaPosition, setTextAreaPosition] = useState({ x: 0, y: 0 })
//     const [textContent, setTextContent] = useState("")
//     const textAreaRef = useRef<HTMLTextAreaElement>(null)

//     const getCanvasCoordinates = (clientX: number, clientY: number) => {
//         const canvas = canvasRef.current
//         if (!canvas) return { x: 0, y: 0 }
        
//         const rect = canvas.getBoundingClientRect()
//         return {
//             x: clientX - rect.left,
//             y: clientY - rect.top
//         }
//     }

//     const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
//         if (selectedTool === "TEXT") {
//             if (showTextArea && textContent.trim()) {
//                 const coords = getCanvasCoordinates(textAreaPosition.x, textAreaPosition.y)
//                 if(textContent.length === 0){
//                     return
//                 }
//                 gameRef.current?.addText(textContent, coords.x+8, coords.y+26)
//             }
            
//             setTextAreaPosition({ x: e.clientX, y: e.clientY })
//             setShowTextArea(true)
//             setTextContent("")
            
//             setTimeout(() => {
//                 textAreaRef.current?.focus()
//             }, 0)
//         }
//     }

//     const handleClickOutside = (e: MouseEvent) => {
//         if (showTextArea && 
//             textAreaRef.current && 
//             !textAreaRef.current.contains(e.target as Node) &&
//             !(e.target instanceof HTMLCanvasElement)) {
            
//             if (textContent.trim()) {
//                 const coords = getCanvasCoordinates(textAreaPosition.x, textAreaPosition.y)
//                 gameRef.current?.addText(textContent, coords.x, coords.y)
//             }
            
//             setShowTextArea(false)
//             setTextContent("")
//         }
//     }

//     useEffect(() => {
//         gameRef.current?.setTool(selectedTool as Tool)
//     }, [selectedTool])

//     useEffect(() => {
//         if(!canvasRef.current) return

//         const g = new Game(roomId, socket, canvasRef.current)
//         gameRef.current = g

//         document.addEventListener('mousedown', handleClickOutside)
        
//         return () => {
//             g.destroy()
//             document.removeEventListener('mousedown', handleClickOutside)
//         }
//     }, [roomId, socket])

//     return (
//         <div className={`z-10 `}>
//             <ShapeOptions selectedTool={selectedTool as Tool} setSelectedTool={setSelectedTool} />
//             <UsersInRoom roomId={roomId} />
//             <LeaveRoom roomId={roomId} />
//             {/* <UndoAndRedo 
//                 game={gameRef.current}
//                 undoHandler={() => {
//                     gameRef.current?.undo()
//                 }}
//                 redoHandler={() => {
//                     gameRef.current?.redo()
//                 }} 
//             /> */}
//             {showTextArea && (
//                 <textarea
//                     ref={textAreaRef}
//                     value={textContent}
//                     onChange={(e) => setTextContent(e.target.value)}
//                     className="fixed bg-neutral-800/0 text-white focus:outline-none p-2"
//                     style={{
//                         left: `${textAreaPosition.x}px`,
//                         top: `${textAreaPosition.y}px`,
//                         minWidth: '100px',
//                         minHeight: '50px',
//                         resize: "none"
//                     }}
//                 />
//             )}
//             <canvas 
//                 ref={canvasRef} 
//                 width={window.innerWidth} 
//                 height={window.innerHeight}  
//                 className={` ${isModalVisible ? "bg-neutral-800/20" : "bg-neutral-800" } z-10`}
//                 onClick={handleCanvasClick} 
//             />
//         </div>
//     )
// }

function Canvas({roomId, socket}: {
    roomId: string,
    socket: WebSocket
}) {
    const { 
        tool, 
        changeTool,
        color, 
        changeColor,
        size,
        changeSize,
        stroke,
        changeStroke
    } = useDraw()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawShapeRef = useRef<DrawShapes | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        drawShapeRef.current?.setTool(tool as Tool)
        drawShapeRef.current?.setColor(color)
        drawShapeRef.current?.setStroke(stroke)
    }, [tool, color, stroke])
    
    useEffect(() => {
        if(canvasRef.current){
            const canvas = canvasRef.current
            const g = new DrawShapes(socket, roomId, canvas, tool as Tool, color, stroke)
            drawShapeRef.current = g

            return () => {
                g.removeEventListeners()
            }
        }
    }, [])

    return <div className='h-full w-full'>
        <ShapeOptions tool={tool as Tool} setTool={changeTool} />
        <div onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <SidebarToggle />
        </div>
        {isSidebarOpen &&
            <Filterbar
                color={color}
                setColor={changeColor}
                size={size}
                setSize={changeSize}
                stroke={stroke}
                setStroke={changeStroke}
            />
        }
        <canvas
            ref={canvasRef}
            height={10000}
            width={10000}
            className='bg-neutral-800 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:8rem_6rem]'
        />
    </div>
}

export default Canvas