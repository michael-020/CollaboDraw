import { prismaClient } from "@repo/db/client"
import { Shapes } from "./types";

interface Point {
  x: number;
  y: number;
}

export const insertIntoDB = async (roomId: string, message: any, userId: string, id: string) => {
  try {
    if(message.type === "RECTANGLE"){
      await prismaClient.shape.create({
        data: {
          id,
          type: "RECTANGLE",
          width: Number(message.width),
          height: Number(message.height),
          x: Number(message.x),
          y: Number(message.y),
          color: message.color,
          strokeWidth: Number(message.strokeWidth) || 1,
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
          id,
          type: "CIRCLE",
          x: Number(message.x),
          y: Number(message.y),
          radiusX: Number(message.radiusX),
          radiusY: Number(message.radiusY),
          color: message.color,
          strokeWidth: Number(message.strokeWidth) || 1,
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
          id,
          type: "LINE",
          x: Number(message.x),
          y: Number(message.y),
          points: message.points, // points -> {endX, endY}
          color: message.color,
          strokeWidth: Number(message.strokeWidth) || 1,
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
          id,
          type: "ARROW",
          x: Number(message.x),
          y: Number(message.y),
          points: message.points, // points -> {endX, endY}
          color: message.color,
          strokeWidth: Number(message.strokeWidth) || 1,
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
          id,
          type: "PENCIL",
          x: message.points[0].x,
          y: message.points[0].y,
          points: message.points,
          color: message.color,
          strokeWidth: Number(message.strokeWidth) || 1,
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
      if(message.textContent){
        await prismaClient.shape.create({
          data: {
            id,
            type: "TEXT",
            x: Number(message.x),
            y: Number(message.y),
            color: message.color,
            textContent: message.textContent,
            strokeWidth: Number(message.strokeWidth) || 1,
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
    else if(message.type === "ERASER"){
      await prismaClient.shape.create({
        data: {
          id,
          type: "ERASER",
          x: message.points[0].x,
          y: message.points[0].y,
          points: message.points,
          color: message.color,
          strokeWidth: Number(message.strokeWidth) || 1,
          user: {
              connect: { id: userId}
          },
          room: {
              connect: { id: roomId}
          }
        }
      })
    }
  } catch (error) {
    console.error("Error while inserting shape in DB: ", error)
  }
  
}

export async function updateShapeInDatabase(shape: Shapes) {
  try {
    const room = await prismaClient.room.findUnique({
        where: { id: shape.roomId }
    });
    if (!room) {
        console.error(`Room not found: ${shape.roomId}. Skipping shape update.`);
    }

    const user = await prismaClient.user.findUnique({
        where: { id: shape.userId }
    });
    if (!user) {
        console.error(`User not found: ${shape.userId}. Skipping shape update.`);
    }

    // Check if the shape exists
    const existingShape = await prismaClient.shape.findUnique({
        where: { id: shape.id }
    });

    const shapeData: any = {
        id: shape.id,
        type: shape.type,
        color: shape.color,
    };

    switch (shape.type) {
        case "RECTANGLE":
          shapeData.x = shape.x;
          shapeData.y = shape.y;
          shapeData.width = Number(shape.width);
          shapeData.height = Number(shape.height);
          break;
        case "CIRCLE":
          shapeData.x = shape.x;
          shapeData.y = shape.y;
          shapeData.radiusX = Number(shape.radiusX);
          shapeData.radiusY = Number(shape.radiusY);
          break;
        case "LINE":  
          shapeData.x = shape.x;
          shapeData.y = shape.y;
          shapeData.points = shape.points;
        case "ARROW":
          shapeData.x = shape.x;
          shapeData.y = shape.y;
          shapeData.points = shape.points;
          break;
        case "PENCIL":
          shapeData.points = shape.points;
          break;
        case "TEXT":
          shapeData.x = shape.x;
          shapeData.y = shape.y;
          shapeData.textContent = shape.textContent;
          break;
        default:
            throw new Error(`Unknown shape type`);
    }

    shapeData.room = {
        connect: { id: shape.roomId } // Connect to the room using its ID
    };

    shapeData.user = {
        connect: { id: shape.userId } // Connect to the user using their ID
    };

    if (existingShape) {
        // Update existing shape
        await prismaClient.shape.update({
            where: { id: shape.id },
            data: shapeData
        });
    } else {
        // Create new shape
        await prismaClient.shape.create({
            data: shapeData
        });
    }
  } catch (error) {
    console.error("Error while updating a shape", error)
  }
   
}

export async function deleteShapeFromDatabase(shapeId: string) {
    try {
        await prismaClient.shape.delete({
            where: { id: shapeId }
        });
    } catch (err: any) {
        if (err.code === 'P2025') {
            console.warn(`Shape with id ${shapeId} not found for deletion.`, err);
        }
        throw err; 
    }
}