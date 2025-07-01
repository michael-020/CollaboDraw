import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const getRoomHandler = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId;
        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId
            }
        });

        res.json({
            room
        });
    } catch (error) {
        console.error("Error while fetching room", error);
        res.status(500).json({
            msg: "internal server error",
            error: (error as Error).message
        });
    }
}