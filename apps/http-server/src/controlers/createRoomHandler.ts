import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const createRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const {name} = req.body
        const room = await prismaClient.room.create({
            data: {
                name: name,
                admin: {
                    connect: {id: userId}
                }
            }
        });

        res.json({
            roomId: room.id
        });
    } catch (error) {
        console.log("Error while creating room", error);
        res.status(500).json({
            msg: "internal server error",
            error: (error as Error).message
        });
    }
}