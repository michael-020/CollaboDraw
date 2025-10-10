import { Request, Response } from "express";
import Groq from "groq-sdk";
import z from "zod";
import { createFlowchartPrompt, createObjectDrawingPrompt } from "../lib/system-prompt";
import { prismaClient } from "@repo/db/client";

const drawingSchema = z.object({
  type: z.enum(["OBJECT", "FLOWCHART"]),
  content: z.string(),
  roomId: z.string()
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateDrawingHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const zodResponse = drawingSchema.safeParse(body);

    if (!zodResponse.success) {
      res.status(401).json({
        msg: "Invalid inputs"
      });
      console.error("Zod error: ", zodResponse.error);
      return;
    }

    const { type, content, roomId } = zodResponse.data;
    const userId = req.user.id;

    const checkRoom = await prismaClient.room.findUnique({
      where: {
        id: roomId
      }
    });

    if (!checkRoom) {
      res.status(401).json({
        msg: "Room not found"
      });
      return;
    }

    if (type === "OBJECT") {
      const { systemPrompt, userPrompt } = createObjectDrawingPrompt(content, roomId, userId);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        model: 'openai/gpt-oss-120b',
        temperature: 0.3,
        max_tokens: 4096
      });

      const resultText = completion.choices[0]?.message?.content || "No response";

      const cleanedResponse = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let shapesArray;
      try {
        shapesArray = JSON.parse(cleanedResponse);
      } catch (err) {
        const match = cleanedResponse.match(/\[.*\]/s);
        if (match) {
          try {
            shapesArray = JSON.parse(match[0]);
          } catch (e) {
            throw new Error("Response is not valid JSON array");
          }
        } else {
          throw new Error("Response is not valid JSON array");
        }
      }

      if (!Array.isArray(shapesArray)) {
        throw new Error("Response is not an array");
      }

      // Filter out duplicate shapes
      const seen = new Set();
      const processedShapes = shapesArray.filter((shape: any) => {
        const dedupeKey = JSON.stringify({
          type: shape.type,
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          radiusX: shape.radiusX,
          radiusY: shape.radiusY,
          textContent: shape.textContent,
          points: shape.points
        });

        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      }).map((shape: any) => ({
        ...shape,
        id: shape.id || crypto.randomUUID(),
        roomId: shape.roomId || roomId,
        userId: shape.userId || userId
      }));

      res.status(200).json({
        result: processedShapes,
        originalPrompt: content
      });
    }
    else if (type === "FLOWCHART") {
      const { systemPrompt, userPrompt } = createFlowchartPrompt(content, roomId, userId);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        model: 'openai/gpt-oss-120b',
        temperature: 0.3,
        max_tokens: 10000,
      });

      const resultText = completion.choices[0]?.message?.content || "No response";
      const cleanedResponse = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let shapesArray;
      try {
        shapesArray = JSON.parse(cleanedResponse);
      } catch (err) {
        const match = cleanedResponse.match(/\[.*\]/s);
        if (match) {
          try {
            shapesArray = JSON.parse(match[0]);
          } catch (e) {
            throw new Error("Response is not valid JSON array");
          }
        } else {
          throw new Error("Response is not valid JSON array");
        }
      }

      if (!Array.isArray(shapesArray)) {
        throw new Error("Response is not an array");
      }

      // Filter out duplicate shapes
      const seen = new Set();
      const processedShapes = shapesArray
        .filter((shape: any) => {
          const dedupeKey = JSON.stringify({
            type: shape.type,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            radiusX: shape.radiusX,
            radiusY: shape.radiusY,
            textContent: shape.textContent,
            points: shape.points
          });

          if (seen.has(dedupeKey)) return false;
          seen.add(dedupeKey);
          return true;
        })
        .map((shape: any) => ({
          ...shape,
          id: shape.id || crypto.randomUUID(),
          roomId: shape.roomId || roomId,
          userId: shape.userId || userId
        }));

      res.status(200).json({
        result: processedShapes,
        originalPrompt: content
      });
    }
  } catch (error: any) {
    console.error("Error while generating:", error?.message || error);
    res.status(500).json({
      msg: "Internal server error",
      error: error?.message || "Unknown error",
    });
  }
};