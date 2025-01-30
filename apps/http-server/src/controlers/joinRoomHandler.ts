// import { prismaClient } from "@repo/db/client";
// import { Request, Response } from "express";


// export const joinRoomHandler = async (req: Request, res: Response) => {
//     try {
//         const roomId = req.params

//         const checkRoom = await prismaClient.room.findFirst({
//             where: {
//                 id: roomId
//             }
//         })

//         if(!checkRoom){
//             res.status(400).json({
//                 msg: "Invalid room"
//             })
//         }



//     } catch (error) {
//         console.error(error)
//         res.status(500).json({
//             msg: "Internal server error"
//         })
//     }
// }