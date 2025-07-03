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
  
  CRITICAL REQUIREMENTS:
  1. Return ONLY a valid JSON array of shape objects
  2. No explanations, no additional text, no markdown formatting
  3. No trailing commas in JSON
  4. All strings must be properly quoted
  5. JSON must be complete and properly closed
  
  TOOL SELECTION GUIDELINES:
  - Use PENCIL tool for organic shapes, curves, irregular forms, or when freehand drawing is more natural
  - Use geometric shapes (RECTANGLE, CIRCLE, LINE, ARROW) for structured, angular, or simple geometric forms
  - Consider using PENCIL for: animals, plants, human figures, natural objects, complex curves, handwriting-style elements
  - Consider using geometric shapes for: buildings, furniture, vehicles, simple icons, technical diagrams
  - You can combine both approaches - use geometric shapes for structure and PENCIL for details
  
  Each shape must have this EXACT structure:

  RECTANGLE:
  {
    "roomId": "${roomId}",
    "userId": "${userId}", 
    "type": "RECTANGLE",
    "x": number,
    "y": number, 
    "width": number,
    "height": number,
    "color": "#ffffff"
  }

  CIRCLE:
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "CIRCLE", 
    "x": number,
    "y": number,
    "radiusX": number,
    "radiusY": number, 
    "color": "#ffffff"
  }

  LINE:
  {
    "roomId": "${roomId}", 
    "userId": "${userId}",
    "type": "LINE",
    "x": number,
    "y": number,
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
    "x": number, 
    "y": number, 
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
    "x": number,
    "y": number,
    "color": "#ffffff"
  }

  PENCIL (for freehand drawing):
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "PENCIL",
    "points": [
      {"x": number, "y": number},
      {"x": number, "y": number},
      {"x": number, "y": number}
    ],
    "color": "#ffffff"
  }

  PENCIL DRAWING GUIDELINES:
  - Create smooth, connected paths with adequate point density (15-30 points for simple curves)
  - Ensure points flow naturally to create recognizable shapes
  - For complex objects, use multiple PENCIL shapes for different parts
  - Points should be close enough to create smooth curves when connected
  - Consider the drawing direction and flow for natural-looking results

  STRICT REQUIREMENTS:
  - Canvas size: 800x600 pixels (x: 0-800, y: 0-600)
  - ALL shapes must use color "#ffffff" 
  - Use 3-8 shapes for clear object recognition (may need more for complex PENCIL drawings)
  - Ensure shapes are well-proportioned and centered
  - Make the object easily identifiable
  - Position shapes to create a cohesive representation
  - Choose the most appropriate tool for each part of the object
  - When adding TEXT inside shapes, calculate center position based on shape dimensions

  TEXT POSITIONING FOR SHAPES:
  - For RECTANGLE: x = rectangle.x + (rectangle.width / 2) - (estimated text width / 2), y = rectangle.y + (rectangle.height / 2)
  - For CIRCLE: x = circle.x - (estimated text width / 2), y = circle.y

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

  REMEMBER: Return ONLY the JSON array for "${objectName}". No other text. Ensure JSON is valid and complete.`;
}

export function createFlowchartPrompt(flowchartDescription: string, roomId: string, userId: string): string {
  return `You are a flowchart assistant that converts step descriptions into visual flowchart coordinates.
  Given the description "${flowchartDescription}", create a clear and well-structured flowchart using appropriate shapes and connections.
  
  CRITICAL REQUIREMENTS:
  1. Return ONLY a valid JSON array of shape objects
  2. No explanations, no additional text, no markdown formatting
  3. No trailing commas in JSON
  4. All strings must be properly quoted
  5. JSON must be complete and properly closed
  
  FLOWCHART DESIGN GUIDELINES:
  - Parse the input to identify individual steps/processes
  - If input format is "step1-step2-step3", treat each as sequential process steps
  - If input is descriptive (e.g., "create a flowchart of request-response cycle in api"), break it down into logical steps
  - Use appropriate flowchart symbols:
    * RECTANGLE for process steps
    * CIRCLE for start/end points
    * ARROW for flow direction
    * TEXT for labels and descriptions
  
  FLOWCHART LAYOUT PRINCIPLES:
  - Start from top (y=80-100) and flow downward
  - Maintain consistent spacing (80-100 pixels between steps vertically)
  - Center elements horizontally around x=400 (canvas center)
  - Use standard flowchart proportions (rectangles: 160 width, 60 height)
  - Ensure arrows clearly show flow direction
  - Add proper labels for each step using TEXT elements
  
  Each shape must have this EXACT structure:

  RECTANGLE:
  {
    "roomId": "${roomId}",
    "userId": "${userId}", 
    "type": "RECTANGLE",
    "x": number,
    "y": number, 
    "width": number,
    "height": number,
    "color": "#ffffff"
  }

  CIRCLE:
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "CIRCLE", 
    "x": number,
    "y": number,
    "radiusX": number,
    "radiusY": number, 
    "color": "#ffffff"
  }

  ARROW:
  {
    "roomId": "${roomId}", 
    "userId": "${userId}",
    "type": "ARROW",
    "x": number, 
    "y": number, 
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
    "textContent": "step_description",
    "x": number,
    "y": number,
    "color": "#ffffff"
  }

  FLOWCHART CONSTRUCTION RULES:
  - Always start with a START circle
  - End with an END circle (if process has clear end)
  - Each process step gets a rectangle with descriptive text
  - Connect all elements with arrows showing flow direction
  - Keep text concise but descriptive
  - Ensure proper alignment and spacing
  - Center text within shapes using proper positioning

  TEXT POSITIONING FOR FLOWCHART SHAPES:
  - For RECTANGLE: x = rectangle.x + (rectangle.width / 2) - (estimated text width / 2), y = rectangle.y + (rectangle.height / 2)
  - For CIRCLE: x = circle.x - (estimated text width / 2), y = circle.y

  STRICT REQUIREMENTS:
  - Canvas size: 800x600 pixels (x: 0-800, y: 0-600)
  - ALL shapes must use color "#ffffff" 
  - Use 5-15 shapes depending on complexity
  - Ensure clear visual hierarchy and flow
  - Make the flowchart easy to follow from top to bottom
  - Position elements to avoid overlapping
  - Use consistent sizing for similar elements

  PARSING GUIDELINES:
  - If input contains hyphens (-), treat as sequential steps: "step1-step2-step3"
  - If input is descriptive, extract key processes and create logical flow
  - For complex processes, include decision points where appropriate
  - Always maintain clear START point
  - Use meaningful, concise labels for each step

  Example for "login-validate-redirect":
  [
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "CIRCLE",
      "x": 400,
      "y": 80,
      "radiusX": 40,
      "radiusY": 25,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "TEXT",
      "textContent": "START",
      "x": 385,
      "y": 80,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "ARROW",
      "x": 400,
      "y": 105,
      "points": {
        "endX": 400,
        "endY": 180
      },
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "RECTANGLE",
      "x": 320,
      "y": 180,
      "width": 160,
      "height": 60,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "TEXT",
      "textContent": "User Login",
      "x": 375,
      "y": 210,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "ARROW",
      "x": 400,
      "y": 240,
      "points": {
        "endX": 400,
        "endY": 320
      },
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "RECTANGLE",
      "x": 320,
      "y": 320,
      "width": 160,
      "height": 60,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "TEXT",
      "textContent": "Validate",
      "x": 385,
      "y": 350,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "ARROW",
      "x": 400,
      "y": 380,
      "points": {
        "endX": 400,
        "endY": 460
      },
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "RECTANGLE",
      "x": 320,
      "y": 460,
      "width": 160,
      "height": 60,
      "color": "#ffffff"
    },
    {
      "roomId": "${roomId}",
      "userId": "${userId}",
      "type": "TEXT",
      "textContent": "Redirect",
      "x": 385,
      "y": 490,
      "color": "#ffffff"
    }
  ]

  REMEMBER: Return ONLY the JSON array for "${flowchartDescription}". No other text. Ensure JSON is valid and complete.`;
}