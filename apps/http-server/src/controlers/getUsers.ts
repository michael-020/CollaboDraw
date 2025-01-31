import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const getUsers = async (req: Request, res: Response) => {
    try {
        const roomId = req.params.roomId

        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId
            },
            include: {
                users: {
                    select: { id: true, name: true, email: true, photo: true}
                }
            }
        })

        if(!room){
            res.status(400).json({
                msg: "room not found"
            })
            return
        }

        // console.log("usrs: ", room.users)
        res.status(200).json(room.users)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}