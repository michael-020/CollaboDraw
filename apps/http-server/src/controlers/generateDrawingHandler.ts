import { Request, Response } from "express";
import axios from "axios";
import z from "zod";
import { createObjectDrawingPrompt, generateUniqueId } from "../lib/utils";

const drawingSchema = z.object({
  type: z.enum(["OBJECT", "FLOWCHART"]),
  content: z.string(),
}).refine((data) => {
  if (data.type === "OBJECT") {
    return /^[^\s]+$/.test(data.content);
  }
  return true;
}, {
  message: "Content must be a single word when type is OBJECT",
  path: ["content"],
});


export const generateDrawingHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const zodResponse = drawingSchema.safeParse(body)

    if(!zodResponse.success){
      res.status(401).json({
        msg: "Invalid inputs"
      })
      return
    }

    const { type, content } = zodResponse.data;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      res.status(500).json({ msg: "Missing Gemini API key" });
      return
    }

    if(type === "OBJECT"){
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

      const prompt = createObjectDrawingPrompt(content);

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
        const shapesArray = JSON.parse(cleanedResponse);

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
    else {
      res.status(500).json({
        msg: "Flow chart feature is not working yet"
      })
    }

  } catch (error: any) {
    console.error("Error while generating:", error?.response?.data || error.message);
    res.status(500).json({
      msg: "Internal server error",
      error: error?.response?.data || error.message,
    });
  }
};

