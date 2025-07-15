import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import z from "zod";


const createRoomSchema = z.object({
    name: z.string().min(1, "Input must atleast contain 1 character")
})

export const createRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const validatedSchema = createRoomSchema.safeParse(req.body)
        if(!validatedSchema.success){
            res.status(401).json({
                msg: "Room name must atleast contain 1 character"
            })
            return;
        }
        const name = validatedSchema.data.name
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
        console.error("Error while creating room", error);
        res.status(500).json({
            msg: "internal server error",
            error: (error as Error).message
        });
    }
}