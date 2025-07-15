import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const getUsersRoomHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const userRooms = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            include: {
                rooms: true
            }
        })

        if(!userRooms){
            res.status(401).json({
                msg: "Could not find rooms"
            })
            return
        }

        const adminRooms = await prismaClient.room.findMany({
            where: {
                adminId: userId
            }
        });

        const allRooms = [...userRooms.rooms];

        adminRooms.forEach(adminRoom => {
            if (!allRooms.some(room => room.id === adminRoom.id)) {
                allRooms.push(adminRoom);
            }
        });

        res.status(200).json(allRooms)
    } catch (error) {
        console.error("Error while getting rooms of a user: ", error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}