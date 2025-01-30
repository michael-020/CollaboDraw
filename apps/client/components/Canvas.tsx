"use client"
import { Game } from '@/app/draw/Game'
import React, { useEffect, useRef, useState } from 'react'
import { ShapeOptions } from './ShapeOptions'

export type Tool = "CIRCLE" | "RECTANGLE" | "LINE" | "ARROW" | "PENCIL"

const Canvas = ({roomId, socket}: {roomId: string, socket: WebSocket}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)  
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool>("CIRCLE")

    useEffect(() => {
      game?.setTool(selectedTool)
      console.log("effect selected tool: ", selectedTool)
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
            <ShapeOptions selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}  className='bg-neutral-800' ></canvas>
        </div>
    )
}

export default Canvas