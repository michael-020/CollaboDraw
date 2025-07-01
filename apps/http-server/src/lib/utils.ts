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

export function createObjectDrawingPrompt(objectName: string): string {
  return `You are a drawing assistant that converts object names into drawing coordinates. 
  
  Given the object "${objectName}", create a simple visual representation using basic shapes.

  Return ONLY a valid JSON array of shape objects. Each shape must have this exact structure:

  For RECTANGLE:
  {
    "id": "unique_string_id",
    "roomId": "temp_room",
    "userId": "temp_user", 
    "type": "RECTANGLE",
    "x": number (left position),
    "y": number (top position), 
    "width": number,
    "height": number,
    "color": "hex_color_code"
  }

  For CIRCLE:
  {
    "id": "unique_string_id",
    "roomId": "temp_room",
    "userId": "temp_user",
    "type": "CIRCLE", 
    "x": number (center x),
    "y": number (center y),
    "radiusX": number,
    "radiusY": number, 
    "color": "hex_color_code"
  }

  For LINE:
  {
    "id": "unique_string_id",
    "roomId": "temp_room", 
    "userId": "temp_user",
    "type": "LINE",
    "x": number (start x),
    "y": number (start y),
    "points": {
      "endX": number,
      "endY": number
    },
    "color": "hex_color_code"
  }

  For TEXT:
  {
    "id": "unique_string_id", 
    "roomId": "temp_room",
    "userId": "temp_user",
    "type": "TEXT",
    "textContent": "text_to_display",
    "x": number,
    "y": number, 
    "points": [{"letter": "each_letter"}],
    "color": "hex_color_code"
  }

  Guidelines:
  - Use coordinates within a 800x600 canvas
  - Choose only #ffffff color for all the shapes
  - Break down complex objects into 2-5 basic shapes
  - Make shapes proportional and visually appealing
  - Generate unique IDs for each shape
  - Return ONLY the JSON array, no additional text or explanation

  Example for "house":
  [
    {
      "id": "rect1",
      "roomId": "temp_room", 
      "userId": "temp_user",
      "type": "RECTANGLE",
      "x": 300,
      "y": 350,
      "width": 200, 
      "height": 150,
      "color": "#8B4513"
    },
    {
      "id": "rect2",
      "roomId": "temp_room",
      "userId": "temp_user", 
      "type": "RECTANGLE",
      "x": 350,
      "y": 450,
      "width": 50,
      "height": 50,
      "color": "#654321"
    }
  ]`;
}