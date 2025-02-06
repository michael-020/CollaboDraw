"use client"
import React, { useEffect, useState } from 'react'
import Canvas from './Canvas'
import { WS_URL } from '@/lib/config'
import { AxiosInstance } from '@/lib/axios'

const RoomCanvas = ({roomId}: {roomId: string}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const { data } = await AxiosInstance.get('/user/get-token');
        const ws = new WebSocket(`${WS_URL}?token=${data.token}`);
        
        ws.onopen = () => {
          setSocket(ws);
          ws.send(JSON.stringify({
            type: "join_room",
            roomId
          }));
        };
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };
  
    connectWebSocket();
  
    return () => {
      if (socket) socket.close();
    };
  }, [roomId])

  if(!socket)
    return <div className='h-screen flex items-center justify-center'>
        <div>
            Connecting to the server...
        </div>
    </div>

  return (
    <Canvas roomId={roomId} socket={socket} />
  )
}

export default RoomCanvas