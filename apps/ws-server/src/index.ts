import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config"
import { pushShape } from "./redis";
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
  // const cookies = request.headers.cookie;
  // if (!cookies) {
  //   console.log("No cookies found");
  //   ws.close();
  //   return;
  // }

  // const parsedCookies = parse(cookies);
  // const token = parsedCookies.jwt;
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

    if(parsedData.type === "redis"){
      pushShape(parsedData)
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) return;
      user.rooms = user.rooms.filter((roomId) => roomId !== parsedData.roomId);
    }

    if (parsedData.type === "draw") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      
      insertIntoDB(roomId, message, userId)
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
            type: message.type
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