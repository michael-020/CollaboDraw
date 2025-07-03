import { Request, Response } from "express";
import axios from "axios";
import z, { object } from "zod";
import { createFlowchartPrompt, createObjectDrawingPrompt, generateUniqueId } from "../lib/utils";
import { prismaClient } from "@repo/db/client";

const drawingSchema = z.object({
  type: z.enum(["OBJECT", "FLOWCHART"]),
  content: z.string(),
  roomId: z.string()
});


export const generateDrawingHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const zodResponse = drawingSchema.safeParse(body)

    if(!zodResponse.success){
      res.status(401).json({
        msg: "Invalid inputs"
      })
      console.error("Zod error: ", zodResponse.error)
      return
    }

    const { type, content, roomId } = zodResponse.data;

    const userId = req.user.id

    const checkRoom = await prismaClient.room.findUnique({
      where: {
        id: roomId
      }
    })

    if(!checkRoom){
      res.status(401).json({
        msg: "Room not found"
      })
      return
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      res.status(500).json({ msg: "Missing API key" });
      return
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    if(type === "OBJECT"){

      const prompt = createObjectDrawingPrompt(content, roomId, userId);

      const response = await axios.post(geminiUrl, {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent output
          maxOutputTokens: 4096,
        }
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

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
        id: shape.id || generateUniqueId(),
        roomId: shape.roomId || roomId,
        userId: shape.userId || userId
      }));


      res.status(200).json({ 
        result: processedShapes,
        originalPrompt: content 
      });
    }
    else if (type === "FLOWCHART") {
      const MAX_TOTAL_SHAPES = 30;
      const CHUNK_SIZE = 5;
      const MAX_ITER = 10;

      let allShapes: any[] = [];
      let done = false;
      let iter = 0;

      while (!done && allShapes.length < MAX_TOTAL_SHAPES && iter < MAX_ITER) {
        // Build a prompt that includes only the shapes so far and asks for the next chunk
        const prompt =
          createFlowchartPrompt(content, roomId, userId) +
          (
            allShapes.length > 0
              ? `\n\nHere are the shapes generated so far:\n${JSON.stringify(allShapes, null, 2)}\nContinue the flowchart by generating the next ${CHUNK_SIZE} shapes. Do not repeat any previous shapes. Return ONLY a valid JSON array of the next shapes. If finished, return [].`
              : `\n\nStart the flowchart by generating the first ${CHUNK_SIZE} shapes. Return ONLY a valid JSON array of shapes.`
          ) +
          `\nIMPORTANT: Return ONLY a valid JSON array of shapes. No explanations, no markdown, no extra text. If there are no more shapes, return [].`;

        const response = await axios.post(
          geminiUrl,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const resultText =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        const cleanedResponse = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let shapesArray: any[] = [];
        try {
          shapesArray = JSON.parse(cleanedResponse);
        } catch (err) {
          const match = cleanedResponse.match(/\[[\s\S]*\]/);
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

        // Stop if nothing new is generated
        if (!Array.isArray(shapesArray) || shapesArray.length === 0) {
          done = true;
          break;
        }

        // Filter out duplicates (by dedupeKey)
        const seen = new Set(
          allShapes.map((shape) =>
            JSON.stringify({
              type: shape.type,
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height,
              radiusX: shape.radiusX,
              radiusY: shape.radiusY,
              textContent: shape.textContent,
              points: shape.points,
            })
          )
        );
        const newShapes = shapesArray.filter((shape: any) => {
          const dedupeKey = JSON.stringify({
            type: shape.type,
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            radiusX: shape.radiusX,
            radiusY: shape.radiusY,
            textContent: shape.textContent,
            points: shape.points,
          });
          if (seen.has(dedupeKey)) return false;
          seen.add(dedupeKey);
          return true;
        });

        allShapes = allShapes.concat(
          newShapes.map((shape: any) => ({
            ...shape,
            id: shape.id || generateUniqueId(),
            roomId: shape.roomId || roomId,
            userId: shape.userId || userId,
          }))
        );

        // If fewer than CHUNK_SIZE shapes were generated, we're likely done
        if (newShapes.length < CHUNK_SIZE) {
          done = true;
        }
        iter++;
      }

      res.status(200).json({
        result: allShapes,
        originalPrompt: content,
      });
    }
  } catch (error: any) {
    console.error("Error while generating:", error?.response?.data || error.message);
    res.status(500).json({
      msg: "Internal server error",
      error: error?.response?.data || error.message,
    });
  }
};

