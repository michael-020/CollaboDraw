import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const deleteRoomHandler = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId;
        const checkRoom = await prismaClient.room.findUnique({
            where: {
                id: roomId
            }
        })

        if(!checkRoom){
            res.status(401).json({
                msg: "Room not found"
            })
            return
        }

        await prismaClient.room.delete({
            where: {
                id: roomId
            }
        })

        res.status(200).json({
            msg: "room delete successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}