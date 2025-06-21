import { prismaClient } from "@repo/db/client"
import { Shapes } from "../redis";

interface Point {
  x: number;
  y: number;
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
        strokeWidth: Number(message.strokeWidth) || 1,
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
        strokeWidth: Number(message.strokeWidth) || 1,
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
        strokeWidth: Number(message.strokeWidth) || 1,
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
        strokeWidth: Number(message.strokeWidth) || 1,
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
        strokeWidth: Number(message.strokeWidth) || 1,
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
    if(message.content){
      newShape = await prismaClient.shape.create({
        data: {
          type: "TEXT",
          x: Number(message.x),
          y: Number(message.y),
          points: message.points,
          color: message.color,
          textContent: message.content,
          strokeWidth: Number(message.strokeWidth) || 1,
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
}

export async function updateShapeInDatabase(shape: Shapes) {
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
            shapeData.width = Number(shape.width);
            shapeData.height = Number(shape.height);
            break;
        case "CIRCLE":
            shapeData.radiusX = Number(shape.radiusX);
            shapeData.radiusY = Number(shape.radiusY);
            break;
        case "LINE":
        case "ARROW":
            shapeData.points = shape.points;
            break;
        case "PENCIL":
            shapeData.points = shape.points;
            break;
        case "TEXT":
            shapeData.textContent = shape.points;
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
}