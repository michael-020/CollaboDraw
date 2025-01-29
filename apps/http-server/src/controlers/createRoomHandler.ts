import { CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const createRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        const parsedData = CreateRoomSchema.safeParse(req.body);

        if (!parsedData.success) {
            res.status(411).json({
                msg: "invalid inputs"
            });
            return;
        }

        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.slug,
                name: parsedData.data.name,
                adminId: userId
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