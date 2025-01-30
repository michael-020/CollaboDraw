"use client"
import React, { useEffect, useState } from 'react'
import Canvas from './Canvas'
import { WS_URL } from '@/lib/config'

const RoomCanvas = ({roomId}: {roomId: string}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
        setSocket(ws)
        ws.send(JSON.stringify({
            type: "join_room",
            roomId
        }))
    }

    return () => {
        ws.close()
    }
  }, [])

  if(!socket)
    return <div>
        Connecting to the server...
    </div>

  return (
    <Canvas roomId={roomId} socket={socket} />
  )
}

export default RoomCanvas