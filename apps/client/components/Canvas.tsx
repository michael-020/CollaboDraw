"use client"
import { Game } from '@/app/draw/game'
import React, { useEffect, useRef } from 'react'

const Canvas = ({roomId, socket}: {roomId: string, socket: WebSocket}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)  

    useEffect(() => {
        if(!canvasRef.current)
            return

        const g = new Game(roomId, socket, canvasRef.current)
    }, [])

  return (
    <div>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}  className='bg-neutral-800' ></canvas>
    </div>
  )
}

export default Canvas