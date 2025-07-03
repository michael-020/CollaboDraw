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
      res.status(500).json({ msg: "Missing Gemini API key" });
      return
    }

    if(type === "OBJECT"){
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

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
          maxOutputTokens: 2048,
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

        const processedShapes = shapesArray.map((shape: any) => ({
          ...shape,
          id: shape.id || generateUniqueId(),
          roomId: shape.roomId || "temp_room",
          userId: shape.userId || "temp_user"
        }));

        res.status(200).json({ 
          result: processedShapes,
          originalPrompt: content 
        });
    }
    else if(type === "FLOWCHART") {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

      const prompt = createFlowchartPrompt(content, roomId, userId);

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
          temperature: 0.3, 
          maxOutputTokens: 2048,
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
        // Try to extract the first JSON array from the string
        const match = cleanedResponse.match(/\[.*\]/s);
        if (match) {
          try {
            shapesArray = JSON.parse(match[0]);
          } catch (e) {
            console.error("Malformed JSON from Gemini:", match[0]);
            throw new Error("Response is not valid JSON array");
          }
        } else {
          console.error("No JSON array found in Gemini response:", cleanedResponse);
          throw new Error("Response is not valid JSON array");
        }
      }

      if (!Array.isArray(shapesArray)) {
        throw new Error("Response is not an array");
      }

      const processedShapes = shapesArray.map((shape: any) => ({
        ...shape,
        id: shape.id || generateUniqueId(),
        roomId: shape.roomId || "temp_room",
        userId: shape.userId || "temp_user"
      }));

      res.status(200).json({ 
        result: processedShapes,
        originalPrompt: content 
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

