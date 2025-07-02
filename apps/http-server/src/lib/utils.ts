import { Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";

export const generateToken = (userId: string, res: Response) => {
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
    });
  
    res.cookie("collabodraw_jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true, 
      sameSite: "lax", 
      secure: true,
    });
  
    return token;
};

export function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createObjectDrawingPrompt(objectName: string, roomId: string, userId: string): string {
  return `You are a drawing assistant that converts object names into drawing coordinates. 
  Given the object "${objectName}", create a simple but recognizable visual representation using basic shapes.
  CRITICAL: Return ONLY a valid JSON array of shape objects. No explanations, no additional text, no markdown formatting - just the raw JSON array.
  Each shape must have this EXACT structure:

  RECTANGLE:
  {
    "roomId": "${roomId}",
    "userId": "${userId}", 
    "type": "RECTANGLE",
    "x": number (left position),
    "y": number (top position), 
    "width": number,
    "height": number,
    "color": "#ffffff"
  }

  CIRCLE:
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "CIRCLE", 
    "x": number (center x),
    "y": number (center y),
    "radiusX": number,
    "radiusY": number, 
    "color": "#ffffff"
  }

  LINE:
  {
    "roomId": "${roomId}", 
    "userId": "${userId}",
    "type": "LINE",
    "x": number (start x),
    "y": number (start y),
    "points": {
      "endX": number,
      "endY": number
    },
    "color": "#ffffff"
  }

  ARROW:
  {
    "roomId": "${roomId}", 
    "userId": "${userId}",
    "type": "ARROW",
    "x": number (start x), 
    "y": number (start y), 
    "points": {
      "endX": number,
      "endY": number
    },
    "color": "#ffffff"
  }

  TEXT:
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "text_to_display",
    "x": number (left position),
    "y": number (top position), 
    "points": [{"letter": "each_letter"}],
    "color": "#ffffff"
  }

  STRICT REQUIREMENTS:
  - Canvas size: 800x600 pixels (x: 0-800, y: 0-600)
  - ALL shapes must use color "#ffffff" 
  - Use 3-6 shapes for clear object recognition
  - Ensure shapes are well-proportioned and centered
  - Make the object easily identifiable
  - Position shapes to create a cohesive representation

  Example for "house":
  [
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "RECTANGLE",
      "x": 300,
      "y": 300,
      "width": 200,
      "height": 150,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "LINE",
      "x": 300,
      "y": 300,
      "points": {
        "endX": 400,
        "endY": 200
      },
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "LINE",
      "x": 400,
      "y": 200,
      "points": {
        "endX": 500,
        "endY": 300
      },
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "RECTANGLE",
      "x": 375,
      "y": 380,
      "width": 50,
      "height": 70,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "RECTANGLE",
      "x": 320,
      "y": 330,
      "width": 40,
      "height": 30,
      "color": "#ffffff"
    }
  ]

  REMEMBER: Return ONLY the JSON array for "${objectName}". No other text.`;
}