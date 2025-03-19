import { prismaClient } from "@repo/db/client"

interface Point {
    x: number;
    y: number;
}

interface Message {
    type: 'RECTANGLE' | 'CIRCLE' | 'LINE' | 'ARROW' | 'PENCIL' | 'TEXT'; // Restrict to valid types
    x: number; // x position
    y: number; // y position
    color: string; // color of the shape
    width?: number; // Only for RECTANGLE
    height?: number; // Only for RECTANGLE
    radiusX?: number; // Only for CIRCLE
    radiusY?: number; // Only for CIRCLE
    points?: Point[] | { endX: number; endY: number }; // Only for LINE, ARROW, and PENCIL
}

export const insertIntoDB = async (roomId: string, message: any, userId: string) => {
    // console.log("Message received:", message);

    if(message.type === "RECTANGLE"){
        await prismaClient.shape.create({
          data: {
            type: "RECTANGLE",
            width: Number(message.width),
            height: Number(message.height),
            x: Number(message.x),
            y: Number(message.y),
            color: message.color,
            user: {
              connect: { id: userId }
            },
            room: {
              connect: { id: roomId }
            }
          }
        })
    } 
    else if(message.type === "CIRCLE"){
        await prismaClient.shape.create({
            data: {
            type: "CIRCLE",
            x: Number(message.x),
            y: Number(message.y),
            radiusX: Number(message.radiusX),
            radiusY: Number(message.radiusY),
            color: message.color,
            user: {
                connect: { id: userId }
            },
            room: {
                connect: { id: roomId }
            }
            }
        })
    }
    else if(message.type === "LINE"){
        
        await prismaClient.shape.create({
          data: {
            type: "LINE",
            x: Number(message.x),
            y: Number(message.y),
            points: message.points, // points -> {endX, endY}
            color: message.color,
            user: {
              connect: { id: userId }
            },
            room: {
              connect: { id: roomId }
            }
          }
        })
    } 
    else if(message.type === "ARROW"){

        await prismaClient.shape.create({
            data: {
            type: "ARROW",
            x: Number(message.x),
            y: Number(message.y),
            points: message.points, // points -> {endX, endY}
            color: message.color,
            user: {
                connect: { id: userId }
            },
            room: {
                connect: { id: roomId }
            }
            }
        })
    }
    else if(message.type === "PENCIL"){

        await prismaClient.shape.create({
            data: {
            type: "PENCIL",
            x: message.points[0].x,
            y: message.points[0].y,
            points: message.points,
            color: message.color,
            user: {
                connect: { id: userId}
            },
            room: {
                connect: { id: roomId}
            }
            }
        })
    }
    else if(message.type === "TEXT"){
        await prismaClient.shape.create({
            data: {
            type: "TEXT",
            x: Number(message.x),
            y: Number(message.y),
            points: message.points,
            color: message.color,
            user: {
                connect: { id: userId }
            },
            room: {
                connect: { id: roomId }
            }
            }
        })
    }
}