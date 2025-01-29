import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const getShapesHandler = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId;

        const messages = await prismaClient.shape.findMany({
            where: {
                roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        });
        res.json(messages);
    } catch (error) {
        console.log("Error while fetching chats", error);
        res.status(500).json({
            msg: "internal server error",
            error: (error as Error).message
        });
    }
}