"use client"
import { Game } from '@/app/draw/Canvas'
import React, { useEffect, useRef, useState } from 'react'
import { ShapeOptions } from './ShapeOptions'
import UsersInRoom from './UsersInRoom'
import LeaveRoom from './LeaveRoom'
import { useAuthStore } from '@/stores/authStore/authStore'
// import UndoAndRedo from './UndoAndRedo'

export type Tool = "CIRCLE" | "RECTANGLE" | "LINE" | "ARROW" | "PENCIL" | "TEXT" | "CURSOR"

const Canvas = ({roomId, socket}: {roomId: string, socket: WebSocket}) => {
    const { isModalVisible } = useAuthStore()
    const canvasRef = useRef<HTMLCanvasElement>(null)  
    const gameRef = useRef<Game | null>(null)
    const [selectedTool, setSelectedTool] = useState<Tool | "">("")
    const [showTextArea, setShowTextArea] = useState(false)
    const [textAreaPosition, setTextAreaPosition] = useState({ x: 0, y: 0 })
    const [textContent, setTextContent] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const getCanvasCoordinates = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        
        const rect = canvas.getBoundingClientRect()
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (selectedTool === "TEXT") {
            if (showTextArea && textContent.trim()) {
                const coords = getCanvasCoordinates(textAreaPosition.x, textAreaPosition.y)
                if(textContent.length === 0){
                    return
                }
                gameRef.current?.addText(textContent, coords.x+8, coords.y+26)
            }
            
            setTextAreaPosition({ x: e.clientX, y: e.clientY })
            setShowTextArea(true)
            setTextContent("")
            
            setTimeout(() => {
                textAreaRef.current?.focus()
            }, 0)
        }
    }

    const handleClickOutside = (e: MouseEvent) => {
        if (showTextArea && 
            textAreaRef.current && 
            !textAreaRef.current.contains(e.target as Node) &&
            !(e.target instanceof HTMLCanvasElement)) {
            
            if (textContent.trim()) {
                const coords = getCanvasCoordinates(textAreaPosition.x, textAreaPosition.y)
                gameRef.current?.addText(textContent, coords.x, coords.y)
            }
            
            setShowTextArea(false)
            setTextContent("")
        }
    }

    useEffect(() => {
        gameRef.current?.setTool(selectedTool as Tool)
    }, [selectedTool])

    useEffect(() => {
        if(!canvasRef.current) return

        const g = new Game(roomId, socket, canvasRef.current)
        gameRef.current = g

        document.addEventListener('mousedown', handleClickOutside)
        
        return () => {
            g.destroy()
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [roomId, socket])

    return (
        <div className={`z-10 `}>
            <ShapeOptions selectedTool={selectedTool as Tool} setSelectedTool={setSelectedTool} />
            <UsersInRoom roomId={roomId} />
            <LeaveRoom roomId={roomId} />
            {/* <UndoAndRedo 
                game={gameRef.current}
                undoHandler={() => {
                    gameRef.current?.undo()
                }}
                redoHandler={() => {
                    gameRef.current?.redo()
                }} 
            /> */}
            {showTextArea && (
                <textarea
                    ref={textAreaRef}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="fixed bg-neutral-800/0 text-white focus:outline-none p-2"
                    style={{
                        left: `${textAreaPosition.x}px`,
                        top: `${textAreaPosition.y}px`,
                        minWidth: '100px',
                        minHeight: '50px',
                        resize: "none"
                    }}
                />
            )}
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}  
                className={` ${isModalVisible ? "bg-neutral-800/20" : "bg-neutral-800" } z-10`}
                onClick={handleCanvasClick} 
            />
        </div>
    )
}

export default Canvas