"use client"
import { Game } from '@/app/draw/game'
import React, { useEffect, useRef, useState } from 'react'
import { ShapeOptions } from './ShapeOptions'
import UsersInRoom from './UsersInRoom'
// import LeaveRoom from './LeaveRoom'
// import DeleteRoom from './DeleteRoom'

export type Tool = "CIRCLE" | "RECTANGLE" | "LINE" | "ARROW" | "PENCIL" | "TEXT"

const Canvas = ({roomId, socket}: {roomId: string, socket: WebSocket}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)  
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool | "">("")
    const [showTextArea, setShowTextArea] = useState(false)
    const [textAreaPosition, setTextAreaPosition] = useState({ x: 0, y: 0 })
    const [textContent, setTextContent] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
      game?.setTool(selectedTool as Tool)
    }, [selectedTool, game])

    useEffect(() => {
        if(!canvasRef.current)
            return

        const g = new Game(roomId, socket, canvasRef.current, {
            onTextStart(x: number, y: number) {
                setShowTextArea(true)
                setTextAreaPosition({x, y})
                setTextContent("")

                setTimeout(() =>  {
                    if(textAreaRef.current){
                        textAreaRef.current.focus()
                    }
                }, 0)
            },
            onTextEnd: (x: number, y: number) => {
                setShowTextArea(false)
                if (textContent.trim()) {
                    g.addText(textContent, x, y)
                }
                setTextContent("")
            }
        })
        setGame(g)

        return () => {
            g.destroy()
        }
    }, [canvasRef, roomId, socket, textContent])

    

    return (
        <div>
            <ShapeOptions selectedTool={selectedTool as Tool} setSelectedTool={setSelectedTool} />
            <UsersInRoom roomId={roomId} />
            {/* <LeaveRoom /> */}
            {/* <DeleteRoom /> */}
            {showTextArea && (
                <textarea
                    ref={textAreaRef}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="fixed bg-neutral-800 text-white focus:outline-none p-2"
                    style={{
                        left: `${textAreaPosition.x}px`,
                        top: `${textAreaPosition.y}px`,
                        minWidth: '100px',
                        minHeight: '50px'
                    }}
                />
            )}
            ello
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}  className='bg-neutral-800' ></canvas>
        </div>
    )
}

export default Canvas