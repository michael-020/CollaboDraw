import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const getUsersRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            include: {
                rooms: true
            }
        })

        if(!user){
            res.status(401).json({
                msg: "Could not find rooms"
            })
            return
        }

        res.status(200).json(user.rooms)
    } catch (error) {
        console.error("Error while getting rooms of a user: ", error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}