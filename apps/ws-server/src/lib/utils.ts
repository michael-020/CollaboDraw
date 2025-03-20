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
    let newShape;
    if(message.type === "RECTANGLE"){
        newShape = await prismaClient.shape.create({
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
        return newShape.id
    } 
    else if(message.type === "CIRCLE"){
        newShape = await prismaClient.shape.create({
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
        return newShape.id
    }
    else if(message.type === "LINE"){
        
        newShape = await prismaClient.shape.create({
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
        return newShape.id
    } 
    else if(message.type === "ARROW"){

        newShape = await prismaClient.shape.create({
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
        return newShape.id
    }
    else if(message.type === "PENCIL"){

        newShape = await prismaClient.shape.create({
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
        return newShape.id
    }
    else if(message.type === "TEXT"){
        newShape = await prismaClient.shape.create({
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
        return newShape.id
    }
}

export async function storeShapeInDB(roomId: string, message: any, userId: string) {
    try {
      const shapeData: any = {
        id: message.id,
        roomId: roomId,
        userId: userId,
        type: message.type,
        color: message.color,
        timestamp: Date.now(),
      };
  
      // Check if the shape has 'x' and 'y' properties
      if ('x' in message && 'y' in message) {
        shapeData.x = message.x;
        shapeData.y = message.y;
      }
  
      switch (message.type) {
        case "RECTANGLE":
          shapeData.width = message.width;
          shapeData.height = message.height;
          break;
        case "CIRCLE":
          shapeData.radiusX = message.radiusX;
          shapeData.radiusY = message.radiusY;
          break;
        case "LINE":
        case "ARROW":
          shapeData.points = message.points;
          break;
        case "PENCIL":
          shapeData.pencilPoints = message.points;
          break;
        case "TEXT":
          shapeData.textContent = message.points;
          break;
        default:
          throw new Error(`Unknown shape type: ${message.type}`);
      }
  
      // Create or update the shape in the database
      const result = await prismaClient.shape.upsert({
        where: { id: message.id },
        update: shapeData,
        create: shapeData
      });
  
      console.log(`Shape ${message.id} saved directly to database`);
      return result;
    } catch (error) {
      console.error(`Error saving shape to database:`, error);
      throw error;
    }
  }