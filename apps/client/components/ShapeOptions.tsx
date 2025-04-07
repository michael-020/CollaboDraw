import React from 'react'
import { Circle, Eraser, Minus, MousePointer, MoveLeft, Pencil, Square, Type } from 'lucide-react'
// import { useAuthStore } from '@/stores/authStore/authStore'
import { Tool } from '@/hooks/useDraw'

export const ShapeOptions = ({tool, setTool}: {tool: Tool, setTool: (s: Tool) => void}) => {
    // const {isModalVisible} = useAuthStore()
    const tools = [
        { id: "RECTANGLE" as Tool, icon: Square },
        { id: "CIRCLE" as Tool, icon: Circle },
        { id: "LINE" as Tool, icon: Minus },
        { id: "ARROW" as Tool, icon: MoveLeft },
        { id: "PENCIL" as Tool, icon: Pencil },
        { id: "TEXT" as Tool, icon: Type },
        { id: "ERASER" as Tool, icon: Eraser },
        { id: "SELECT" as Tool, icon: MousePointer },
      ];
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 bg-gray-100/30 backdrop-blur-sm rounded-md ">
        <div className="flex gap-2 px-2 py-2 rounded shadow-lg">
        {tools.map((t) => {
            const Icon = t.icon;
            return (
            <button
                onClick={() => setTool(t.id)}
                key={t.id}
                className={`${t.id == tool ? "bg-purple-200" : ""} ${t.id === "ERASER" || t.id === "TEXT" ? "hidden" : ""} p-2 rounded transition-all relative duration-500 cursor-pointer`}
            >
                <Icon
                className={`w-4 h-4 transition-all duration-500 text-gray-900`}
                />
            </button>
            );
        })}
        </div>
    </div>
  )
}
