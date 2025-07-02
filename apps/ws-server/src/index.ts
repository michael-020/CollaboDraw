import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
import { updateData } from "./queues/shapeQueue";
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

  const existingUserIndex = users.findIndex(u => u.userId === userId);
  if (existingUserIndex >= 0) {
    users[existingUserIndex]!.ws = ws;
  } else {
    users.push({ userId, rooms: [], ws });
  }

  ws.on("message", async function message(data) {
    const messageData = typeof data === "string" ? data : data.toString();
    const parsedData = JSON.parse(messageData);

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) return;
      const roomId = (parsedData.roomId)
      user.rooms.push(roomId);
    }

    if(parsedData.type === "update"){
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      message.roomId = roomId
      console.log("roomId: ", roomId)
      console.log("update message: ", parsedData)
      try {
        if (!message.id) {
          console.error("Shape ID is required for edit operations");
          ws.send(JSON.stringify({
            type: "error",
            message: "Shape ID is required for edit operations"
          }));
          return;
        }

        const usersInRoom = users.filter(user => 
          user.rooms.includes(roomId.toString()) && user.userId !== userId
        );

        usersInRoom.forEach(user => {
          const broadcastMessage = {
            type: "update",
            message: {
              ...message,
              userId
            },
            roomId
          };

          user.ws.send(JSON.stringify(broadcastMessage));
        });

        await updateData(roomId, message, userId); 
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

      console.log("draw message: ", parsedData)
      const shapeId = await insertIntoDB(roomId, message, userId);
      
      const usersInRoom = users.filter(user => 
        user.rooms.includes(roomId.toString()) && user.userId !== userId
      );

      usersInRoom.forEach(user => {
        const broadcastMessage = {
          type: "draw",
          message: {
            ...message,
            type: message.type,
            id: shapeId,
            tempId: message.tempId 
          },
          roomId
        };
        user.ws.send(JSON.stringify(broadcastMessage));
      });
      
      const originalUser = users.find(user => user.userId === userId);
      if (originalUser) {
        const responseMessage = {
          type: "draw",
          message: {
            ...message,
            type: message.type,
            id: shapeId,
            tempId: message.tempId
          },
          roomId
        };
        originalUser.ws.send(JSON.stringify(responseMessage));
      }
    }
  });

  ws.on("close", () => {
    users.splice(users.findIndex((u) => u.userId === userId), 1);
  });
});