import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const joinRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        const roomId = req.params.roomId

        const room = await prismaClient.room.findUnique({
            where: { id: roomId },
            include: { users: {
                select: { id: true, name: true, email: true, photo: true}
            } }
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return
        }

        // const isUserAlreadyInRoom = room.users.some(user => user.id === userId);
        // if (isUserAlreadyInRoom) {
        //     res.status(400).json({ message: "User already in room" });
        //     return
        // }

        const updatedRoom = await prismaClient.room.update({
            where: {id: roomId},
            data: {
                users: { connect: { id: userId } }
            },
            include: { users: {
                select: {
                    id: true,
                    name: true,
                    photo: true,
                    
                }
            } }
        })

        res.status(200).json(updatedRoom)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}