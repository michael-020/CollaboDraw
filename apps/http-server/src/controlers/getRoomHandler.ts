import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const getRoomHandler = async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug;
        const room = await prismaClient.room.findFirst({
            where: {
                slug
            }
        });

        res.json({
            room
        });
    } catch (error) {
        console.log("Error while fetching room", error);
        res.status(500).json({
            msg: "internal server error",
            error: (error as Error).message
        });
    }
}