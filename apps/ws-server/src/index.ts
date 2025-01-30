import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config"

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
  const cookies = request.headers.cookie;
  if (!cookies) {
    ws.close();
    return;
  }

  const parsedCookies = parse(cookies);
  const token = parsedCookies.jwt;

  if (!token) {
    console.error("No token found in cookies");
    ws.close();
    return;
  }

  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    console.error("invalid token")
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

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) return;
      user.rooms = user.rooms.filter((roomId) => roomId !== parsedData.roomId);
    }

    if (parsedData.type === "draw") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      // message -> {
      //   type:  "rect",
      //   startX: 12,
      //   startY: 123,
      //   width: 123,
      //   height: number
      // }

      if(message.type === "RECTANGLE"){
        await prismaClient.shape.create({
          data: {
            type: "RECTANGLE",
            width: Number(message.width),
            height: Number(message.height),
            x: Number(message.x),
            y: Number(message.y),
            user: {
              connect: { id: userId }
            },
            room: {
              connect: { id: roomId }
            }
          }
        })
      }

      users.forEach((user) => {
        if (user.rooms.includes(roomId.toString())) {

          user.ws.send(
            JSON.stringify({
              type: "draw",
              message,
              roomId,
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    users.splice(users.findIndex((u) => u.userId === userId), 1);
  });
});
