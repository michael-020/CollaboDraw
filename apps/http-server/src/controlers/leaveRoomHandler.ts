import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";


export const leaveRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id
        const roomId = req.params.roomId

        const room = await prismaClient.room.findFirst({
            where: {
                id: roomId,
            },
            select: {
                id: true, 
                name: true, 
                adminId: true,
                users: {
                    select: {
                        id: true
                    }
                }
            }
        })

        if(!room){
            res.status(400).json({
                msg: "invalid roomId"
            })
            return
        }

        const isUserInRoom = room.users.some(user => user.id === userId);
        if (!isUserInRoom) {
            res.status(400).json({ msg: "User is not a member of this room" });
            return
        }

        const updatedRoom = await prismaClient.room.update({
            where: {
                id: roomId
            },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            },
            select: {
                id: true,
                name: true,
                adminId: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        photo: true,
                    }
                }
            }
        })

        res.status(200).json(updatedRoom.users)

    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}