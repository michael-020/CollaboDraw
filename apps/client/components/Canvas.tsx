"use client"
import { Game } from '@/app/draw/Game'
import React, { useEffect, useRef, useState } from 'react'
import { ShapeOptions } from './ShapeOptions'
import UsersInRoom from './UsersInRoom'

export type Tool = "CIRCLE" | "RECTANGLE" | "LINE" | "ARROW" | "PENCIL"

const Canvas = ({roomId, socket}: {roomId: string, socket: WebSocket}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)  
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool | "">("")
   

    useEffect(() => {
      game?.setTool(selectedTool as Tool)
    }, [selectedTool, game])

    useEffect(() => {
        if(!canvasRef.current)
            return

        const g = new Game(roomId, socket, canvasRef.current)
        setGame(g)

        return () => {
            g.destroy()
        }
    }, [canvasRef])

    

    return (
        <div>
            <ShapeOptions selectedTool={selectedTool as Tool} setSelectedTool={setSelectedTool} />
            <UsersInRoom roomId={roomId} />
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}  className='bg-neutral-800' ></canvas>
        </div>
    )
}

export default Canvas