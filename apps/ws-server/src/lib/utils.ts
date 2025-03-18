// import { prismaClient } from "@repo/db/client";

// // Define types for different message shapes
// interface BaseMessage {
//   x: number;
//   y: number;
//   color: string;
//   userId: string;
//   roomId: string;
// }

// interface RectangleMessage extends BaseMessage {
//   type: "RECTANGLE";
//   width: number;
//   height: number;
// }

// interface CircleMessage extends BaseMessage {
//   type: "CIRCLE";
//   radiusX: number;
//   radiusY: number;
// }

// interface LineMessage extends BaseMessage {
//   type: "LINE";
//   points: { endX: number; endY: number };
// }

// interface ArrowMessage extends BaseMessage {
//   type: "ARROW";
//   points: { endX: number; endY: number };
// }

// interface PencilMessage extends BaseMessage {
//   type: "PENCIL";
//   points: { x: number; y: number }[]; // List of points
// }

// interface TextMessage extends BaseMessage {
//   type: "TEXT";
//   points: { x: number; y: number }[]; // List of points
// }

// type Message = RectangleMessage | CircleMessage | LineMessage | ArrowMessage | PencilMessage | TextMessage;

// interface Params {
//   message: Message;
//   userId: string;
//   roomId: string;
// }

// // Function to insert into the database
// export async function insertIntoDB({ message, userId, roomId }: Params) {
//   if (message.type === "RECTANGLE") {
//     await prismaClient.shape.create({
//       data: {
//         type: "RECTANGLE",
//         width: message.width,
//         height: message.height,
//         x: message.x,
//         y: message.y,
//         color: message.color,
//         user: {
//           connect: { id: userId },
//         },
//         room: {
//           connect: { id: roomId },
//         },
//       },
//     });
//   } else if (message.type === "CIRCLE") {
//     await prismaClient.shape.create({
//       data: {
//         type: "CIRCLE",
//         x: message.x,
//         y: message.y,
//         radiusX: message.radiusX,
//         radiusY: message.radiusY,
//         color: message.color,
//         user: {
//           connect: { id: userId },
//         },
//         room: {
//           connect: { id: roomId },
//         },
//       },
//     });
//   } else if (message.type === "LINE" || message.type === "ARROW") {
//     await prismaClient.shape.create({
//       data: {
//         type: message.type,
//         x: message.x,
//         y: message.y,
//         points: message.points,
//         color: message.color,
//         user: {
//           connect: { id: userId },
//         },
//         room: {
//           connect: { id: roomId },
//         },
//       },
//     });
//   } else if (message.type === "PENCIL") {
//     await prismaClient.shape.create({
//       data: {
//         type: "PENCIL",
//         x: message.points[0].x,
//         y: message.points[0].y,
//         points: message.points,
//         color: message.color,
//         user: {
//           connect: { id: userId },
//         },
//         room: {
//           connect: { id: roomId },
//         },
//       },
//     });
//   } else if (message.type === "TEXT") {
//     await prismaClient.shape.create({
//       data: {
//         type: "TEXT",
//         x: message.x,
//         y: message.y,
//         points: message.points,
//         color: message.color,
//         user: {
//           connect: { id: userId },
//         },
//         room: {
//           connect: { id: roomId },
//         },
//       },
//     });
//   }
// }