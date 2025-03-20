import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config"
import { pushShape, updateData, insertIntoDatabase } from "./redis";
import { insertIntoDB } from "./lib/utils";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

const checkUser = (token: string | undefined): string | null => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (typeof decoded === "string" || !decoded.userId) return null;
    return decoded.userId;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";

  if (!token) {
    console.error("No token found in cookies");
    ws.close();
    return;
  }

  const userId = checkUser(token);

  if (!userId) {
    console.error("invalid token")
    ws.close();
    return;
  }

  users.push({ userId, rooms: [], ws });
  ws.on("message", async function message(data) {
    const messageData = typeof data === "string" ? data : data.toString();
    const parsedData = JSON.parse(messageData);

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) return;
      user.rooms.push(parsedData.roomId);
    }

    if(parsedData.type === "update"){
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      try {
        // Make sure we have a valid ID for the shape
        if (!message.id) {
          console.error("Shape ID is required for edit operations");
          ws.send(JSON.stringify({
            type: "error",
            message: "Shape ID is required for edit operations"
          }));
          return;
        }

        await updateData(roomId, message, userId);

        // Broadcast the edit to all users in the room
        const usersInRoom = users.filter(user => user.rooms.includes(roomId.toString()));
        
        usersInRoom.forEach(user => {
          const broadcastMessage = {
            type: "update", // Changed from "draw" to "edit" for clarity
            message: {
              ...message,
              userId // Include the user ID in the broadcast
            },
            roomId
          };
          user.ws.send(JSON.stringify(broadcastMessage));
        });
      } catch (error) {
        console.error("Error processing edit operation:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to process edit operation"
        }));
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) return;
      user.rooms = user.rooms.filter((roomId) => roomId !== parsedData.roomId);
    }

    if (parsedData.type === "draw") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      const shapeId = await insertIntoDB(roomId, message, userId)
      // message -> {
      //   type:  "rect",
      //   startX: 12,
      //   startY: 123,
      //   width: 123,
      //   height: number
      // }

      const usersInRoom = users.filter(user => user.rooms.includes(roomId.toString()));

      usersInRoom.forEach(user => {
        const broadcastMessage = {
          type: "draw",
          message: {
            ...message,
            type: message.type,
            id: shapeId
          },
          roomId
        };
        user.ws.send(JSON.stringify(broadcastMessage));
      });
    }
  });

  ws.on("close", () => {
    users.splice(users.findIndex((u) => u.userId === userId), 1);
  });
});