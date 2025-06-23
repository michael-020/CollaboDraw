import { Request, Response } from "express";
import axios from "axios";

export const generateDrawingHandler = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      res.status(500).json({ msg: "Missing Gemini API key" });
      return
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const response = await axios.post(geminiUrl, {
      contents: [
        {
          parts: [
            {
              text: content || "Explain how AI works in a few words",
            },
          ],
        },
      ],
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ result: resultText });

  } catch (error: any) {
    console.error("Error while generating:", error?.response?.data || error.message);
    res.status(500).json({
      msg: "Internal server error",
      error: error?.response?.data || error.message,
    });
  }
};
