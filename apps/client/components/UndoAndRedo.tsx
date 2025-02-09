import { Game } from '@/app/draw/Canvas'
import { Redo, Undo } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface UndoAndRedoProps {
    undoHandler: () => void
    redoHandler: () => void
    game: Game | null
}

const UndoAndRedo = ({ undoHandler, redoHandler, game }: UndoAndRedoProps) => {
    const [canRedo, setCanRedo] = useState(false)
    const [canUndo, setCanUndo] = useState(false)

    useEffect(() => {
        const updateButtonStates = () => {
            if (!game) return

            const existingShapes = game.getExistingShapes()
            setCanUndo(existingShapes.length > 0)

            setCanRedo(game.canRedo())
        }

        const interval = setInterval(updateButtonStates, 100)

        return () => clearInterval(interval)
    }, [game])

    const handleUndo = () => {
        undoHandler()
        setCanRedo(true)
        
        if (game) {
            const existingShapes = game.getExistingShapes()
            setCanUndo(existingShapes.length > 0)
        }
    }

    const handleRedo = () => {
        redoHandler()
        
        if (game) {
            setCanRedo(game.canRedo())
            // setCanUndo(true)
        }
    }

    return (
        <div className='fixed bottom-4 left-4 bg-gray-100/30  backdrop-blur-sm z-50 rounded-md'>
            <div className='w-full p-3 flex items-center justify-center gap-3'>
                <button 
                    onClick={handleUndo}
                    className={`${canUndo ? "text-white" : "text-gray-400"}`}
                    disabled={!canUndo}
                >
                    <Undo />
                </button>
                <button 
                    onClick={handleRedo}
                    className={`${canRedo ? "text-white" : "text-gray-400"}`}
                    disabled={!canRedo}
                >
                    <Redo />
                </button>
            </div>
        </div>
    )
}

export default UndoAndRedo