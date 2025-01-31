import { Request, Response } from "express";


export const leaveRoomHandler = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}