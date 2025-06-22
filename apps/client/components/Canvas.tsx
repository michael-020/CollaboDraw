"use client"
import React, { useEffect, useRef, useState } from 'react'
import { ShapeOptions } from './ShapeOptions'
import { Tool, useDraw } from '@/hooks/useDraw'
import Filterbar from './Filterbar'
import { DrawShapes } from '@/draw/drawShape'
import SidebarToggle from './SidebarToggle'
import LeaveRoom from './LeaveRoom'

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
        if (tool === "TEXT") {
            if (showTextArea && textContent.trim()) {
                if(textContent.length === 0){
                    return
                }
                drawShapeRef.current?.addText(textContent, textAreaPosition.x+8, textAreaPosition.y+26)
            }
            const coords = getCanvasCoordinates(e.clientX, e.clientY)
            setTextAreaPosition(coords)
            setShowTextArea(true)
            setTextContent("")
            
            textAreaRef.current?.focus()
        }
    }

    const handleClickOutside = (e: MouseEvent) => {
        if (showTextArea && 
            textAreaRef.current && 
            !textAreaRef.current.contains(e.target as Node) &&
            !(e.target instanceof HTMLCanvasElement)) {
            
            if (textContent.trim()) {
                drawShapeRef.current?.addText(textContent, textAreaPosition.x+8, textAreaPosition.y+24)
            }
            
            setShowTextArea(false)
            setTextContent("")
        }
    }

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
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                g.removeEventListeners()
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [roomId, socket])

    return <div className='h-full w-full'>
        <ShapeOptions tool={tool as Tool} setTool={changeTool} />
        <LeaveRoom />
        {showTextArea && <textarea 
            ref={textAreaRef}
            className={`fixed bg-neutral-800/0 text-white w-auto focus:outline-none p-2 text-[${color}]`}
            style={{
                left: `${textAreaPosition.x + (canvasRef.current?.getBoundingClientRect().left || 0)}px`,
                top: `${textAreaPosition.y + (canvasRef.current?.getBoundingClientRect().top || 0)}px`,
                resize: "none",
                whiteSpace: 'pre',
                color: color,          
                caretColor: color  
            }}
            value={textContent}
            onChange={(e) => {
                setTextContent(e.target.value);
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.width = 'auto';
                target.style.height = target.scrollHeight + 'px';
                target.style.width = target.scrollWidth + 'px';
            }}
            rows={1}
        />}
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
            onClick={handleCanvasClick}
            className={`bg-neutral-800 `}
            style={{
                cursor: tool === "ERASER" 
                    ? ERASER_CURSOR
                    : tool === "SELECT" 
                    ? "default"
                    : tool === "AI"
                    ? "default" 
                    : tool === "TEXT"
                    ? "text"
                    : "crosshair"
            }}
        />
    </div>
}
const ERASER_CURSOR = "url('data:image/svg+xml;utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"%3E%3Crect x=\"6\" y=\"4\" width=\"12\" height=\"8\" rx=\"1\" fill=\"%\" stroke=\"white\" stroke-width=\"1.5\" transform=\"rotate(15 12 8)\"/%3E%3C/svg%3E') 10 10, auto";

export default Canvas