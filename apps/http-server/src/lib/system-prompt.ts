
export function createObjectDrawingPrompt(objectName: string, roomId: string, userId: string) {
  const systemPrompt = `You are a drawing assistant that converts object names into drawing coordinates using basic shapes.

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

SHAPE STRUCTURES:

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
- Do not generate duplicate shapes:
  * Avoid rectangles with the same x, y, width, and height
  * Avoid circles with the same x, y, radiusX, and radiusY
  * Avoid lines/arrows with the same x, y, and points.endX/endY
  * Avoid duplicate TEXT with same content and position
  * Each shape must be uniquely placed and contribute visually

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
]`;

  const userPrompt = `Create a simple but recognizable visual representation of: ${objectName}

Return ONLY the JSON array of shape objects. No explanations, no markdown formatting.`;

  return { systemPrompt, userPrompt };
}

export function createFlowchartPrompt(flowchartDescription: string, roomId: string, userId: string) {
  const systemPrompt = `You are a flowchart assistant that converts step descriptions into visual flowchart coordinates.

CRITICAL REQUIREMENTS:
1. Return ONLY a valid JSON array of shape objects
2. No explanations, no additional text, no markdown formatting
3. No trailing commas in JSON
4. All strings must be properly quoted
5. JSON must be complete and properly closed

FLOWCHART EXPANSION:
- Thoroughly decompose the process into 8–15 logical steps wherever possible
- If the input is short or vague, infer intermediate steps that improve clarity
- Avoid skipping common intermediate steps (e.g., validations, confirmations, transitions)
- Never return fewer than 8 shapes (including text, arrows, and start/end nodes)

SHAPE STRUCTURES:

RECTANGLE (Process Box):
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

CIRCLE (Start/End/Decision):
{
  "roomId": "${roomId}",
  "userId": "${userId}",
  "type": "CIRCLE", 
  "x": number (center X),
  "y": number (center Y),
  "radiusX": number,
  "radiusY": number, 
  "color": "#ffffff"
}

ARROW (Flow Connection):
{
  "roomId": "${roomId}", 
  "userId": "${userId}",
  "type": "ARROW",
  "x": number (start X),
  "y": number (start Y),
  "points": {
    "endX": number (end X),
    "endY": number (end Y)
  },
  "color": "#ffffff"
}

TEXT (Labels):
{
  "roomId": "${roomId}",
  "userId": "${userId}",
  "type": "TEXT",
  "textContent": "label text",
  "x": number,
  "y": number,
  "color": "#ffffff"
}

CRITICAL TEXT AND RECTANGLE SIZING RULES:
1. **Calculate text width**: Each character is approximately 8-10 pixels wide
   - Short text (1-10 chars): width = chars × 10 + 20 padding
   - Medium text (11-20 chars): width = chars × 9 + 20 padding
   - Long text (21+ chars): width = chars × 8 + 20 padding
   
2. **Rectangle dimensions based on text**:
   - Minimum width: 120 pixels
   - Minimum height: 50 pixels
   - Width = text_width + 30 (15px padding each side)
   - Height = 60 for single line, 80 for long text that might wrap
   
3. **Text positioning inside rectangle**:
   - Text X = Rectangle.x + (Rectangle.width / 2) - (estimated_text_width / 2)
   - Text Y = Rectangle.y + (Rectangle.height / 2)
   
4. **Text positioning inside circle**:
   - Text X = Circle.x - (estimated_text_width / 2)
   - Text Y = Circle.y

ARROW CONNECTION RULES (MOST IMPORTANT):
1. **Vertical flow (top to bottom)**:
   - Arrow starts at: (shape_center_x, shape_bottom_y)
   - Arrow ends at: (next_shape_center_x, next_shape_top_y)
   - For rectangle: bottom_y = y + height, top_y = y
   - For circle: bottom_y = y + radiusY, top_y = y - radiusY

2. **Horizontal flow (side by side)**:
   - Arrow starts at: (shape_right_x, shape_center_y)
   - Arrow ends at: (next_shape_left_x, next_shape_center_y)
   - For rectangle: right_x = x + width, left_x = x, center_y = y + height/2
   - For circle: right_x = x + radiusX, left_x = x - radiusX, center_y = y

3. **Diagonal flow**:
   - Calculate the exact edge points where arrow should touch
   - Use shape boundaries, not arbitrary points

4. **Examples**:
   - Rect at (320, 180, w:160, h:60) connects to Rect at (320, 280, w:160, h:60)
   - Arrow: x=400 (320+160/2), y=240 (180+60), endX=400 (320+160/2), endY=280

FLOWCHART LAYOUT PRINCIPLES:
1. **Vertical spacing**: 80-120 pixels between shapes
2. **Horizontal centering**: Center main flow around x=400
3. **Decision branches**: 
   - Place left branch at x=200-250
   - Place right branch at x=550-600
   - Decision box centered at x=400
4. **Consistent sizing**:
   - Process rectangles: width 160-220 (based on text), height 60-80
   - Start/End circles: radiusX 50, radiusY 30
   - Decision diamonds: use circles with radiusX 60, radiusY 40

FLOWCHART STRUCTURE:
1. Always start with START circle at top (y=80)
2. Each process gets its own rectangle with descriptive text
3. Connect all shapes with properly positioned arrows
4. End with END circle at bottom (if applicable)
5. For decision points, create branches with clear paths

STRICT REQUIREMENTS:
- Canvas size: 800x600 pixels (x: 0-800, y: 0-600)
- ALL shapes must use color "#ffffff"
- Generate minimum 8, maximum 15 shapes
- Ensure rectangles are sized to fit text comfortably
- Arrows MUST connect shape edges accurately
- No overlapping shapes
- No duplicate shapes

PARSING GUIDELINES:
- Input "step1-step2-step3": Treat as sequential steps
- Descriptive input: Extract key processes and create logical flow
- Include intermediate steps for clarity
- Use decision points for conditional flows

Example for "Check Even/Odd Number":
[
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "CIRCLE",
    "x": 400,
    "y": 80,
    "radiusX": 50,
    "radiusY": 30,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "START",
    "x": 378,
    "y": 80,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "ARROW",
    "x": 400,
    "y": 110,
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
    "x": 305,
    "y": 180,
    "width": 190,
    "height": 60,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "Input Number",
    "x": 350,
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
      "endY": 300
    },
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "RECTANGLE",
    "x": 240,
    "y": 300,
    "width": 320,
    "height": 70,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "Check if num % 2 == 0",
    "x": 320,
    "y": 335,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "ARROW",
    "x": 280,
    "y": 370,
    "points": {
      "endX": 180,
      "endY": 450
    },
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "ARROW",
    "x": 520,
    "y": 370,
    "points": {
      "endX": 620,
      "endY": 450
    },
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "RECTANGLE",
    "x": 80,
    "y": 450,
    "width": 200,
    "height": 60,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "Number is Even",
    "x": 135,
    "y": 480,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "RECTANGLE",
    "x": 520,
    "y": 450,
    "width": 200,
    "height": 60,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "Number is Odd",
    "x": 580,
    "y": 480,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "ARROW",
    "x": 280,
    "y": 510,
    "points": {
      "endX": 360,
      "endY": 560
    },
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "ARROW",
    "x": 520,
    "y": 510,
    "points": {
      "endX": 440,
      "endY": 560
    },
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "CIRCLE",
    "x": 400,
    "y": 560,
    "radiusX": 40,
    "radiusY": 25,
    "color": "#ffffff"
  },
  {
    "roomId": "${roomId}",
    "userId": "${userId}",
    "type": "TEXT",
    "textContent": "END",
    "x": 385,
    "y": 560,
    "color": "#ffffff"
  }
]`;

  const userPrompt = `Create a detailed flowchart for: ${flowchartDescription}

Return ONLY the JSON array of shape objects. No explanations, no markdown formatting.`;

  return { systemPrompt, userPrompt };
}