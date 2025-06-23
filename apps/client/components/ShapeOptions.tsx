import React from 'react'
import { Circle, Eraser, Minus, MousePointer, MoveLeft, Pencil, Square, Type } from 'lucide-react'
import { Tool } from '@/hooks/useDraw'
import AiIcon from '@/icons/AiIcon';

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
        { id: "AI" as Tool, icon: AiIcon },
      ];
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 bg-gray-100/30 backdrop-blur-sm rounded-md ">
        <div className="flex gap-2 px-2 py-2 rounded shadow-lg">
        {tools.map((t) => {
            const Icon = t.icon;
            return (
            <button
                onClick={() =>{ 
                    setTool(t.id)
                    console.log("selected tool: ", t.id)
                }}
                key={t.id}
                className={`${t.id == tool ? "bg-emerald-400" : ""} p-2 rounded transition-all relative duration-500 cursor-pointer`}
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
