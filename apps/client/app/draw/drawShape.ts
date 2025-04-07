/* eslint-disable @typescript-eslint/no-explicit-any */

import { Color, Stroke, Tool } from "@/hooks/useDraw";
import { getExistingShapes } from "./http";

export type Shapes = {
    id?: string,
    type: "RECTANGLE",
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    strokeWidth?: number
} | {
    id?: string,
    type: "CIRCLE",
    x: number, 
    y: number, 
    radiusX: number,
    radiusY: number,
    color: string,
    strokeWidth?: number
} | {
    id?: string,
    type: "LINE",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color: string,
    strokeWidth?: number
} | {
    id?: string,
    type: "ARROW",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color: string,
    strokeWidth?: number
} | {
    id?: string,
    type: "PENCIL",
    points: Array<{x: number, y: number}>,
    color: string,
    strokeWidth?: number
} | {
    id?: string,
    type: "TEXT",
    x: number,
    y: number,
    points: Array<{letter: string}>,
    color: string,
    strokeWidth?: number
}

export class DrawShapes{
    private socket: WebSocket
    private roomId: string
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private color: Color
    private stroke: Stroke

    // Drawing state
    private existingShapes: Shapes[] = [];
    private pencilPath: any[] = [];
    private clicked: boolean = false;
    private x: number = 0;
    private y: number = 0;
    private currentPoints: Array<{x: number, y: number}> = []

    // Selection state
    public selectedTool: Tool  | "" = "";
    public selectedShape: Shapes | "" = "";
    private selectedOffsetX: number = 0;
    private selectedOffsetY: number = 0;

    // Zoom/Scale properties
    private scale: number = 1;
    private minScale: number = 0.5;
    private maxScale: number = 2;
    private offsetX: number = 0;
    private offsetY: number = 0;

    // Corner detection flags
    private isTL: boolean = false;  // Top-Left
    private isTR: boolean = false;  // Top-Right
    private isBL: boolean = false;  // Bottom-Left
    private isBR: boolean = false;  // Bottom-Right
    private isELR: boolean = false; // Ellipse Right
    private isELL: boolean = false; // Ellipse Left
    private isELT: boolean = false; // Ellipse Top
    private isELB: boolean = false; // Ellipse Bottom
    private isLNS: boolean = false; // Line Start
    private isLNE: boolean = false; // Line End
    private isARRS: boolean = false; // Arrow Start
    private isARRE: boolean = false; // Arrow End

    constructor(socket: WebSocket, roomId: string, canvas: HTMLCanvasElement, tool: Tool, color: Color, stroke: Stroke | number) {
        this.socket = socket
        this.roomId = roomId
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.selectedTool = tool
        this.color = color
        this.stroke = stroke as Stroke
        this.existingShapes = []
        this.loadExistingShapes();
        this.socketHandler()
        this.initializeEventListeners();
    }

    async loadExistingShapes() {
        this.existingShapes = await getExistingShapes(this.roomId)
        console.log("existing Shapes array: ", this.existingShapes)
        this.redrawCanvas();
    }
      
    initializeEventListeners() {
        this.removeEventListeners();

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    }
      
    removeEventListeners(): void {
        this.canvas.removeEventListener("mousedown", this.handleMouseDown)
        this.canvas.removeEventListener("mouseup",this.handleMouseUp)
        this.canvas.removeEventListener("mousemove", this.handleMouseMove)
        this.canvas.removeEventListener("wheel", this.handleWheel)
    }
      
    handleMouseDown(e: MouseEvent) {
        if (!(e.target instanceof HTMLCanvasElement)) 
            return;
        this.clicked = true
        
        // Account for scroll position
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        this.x = e.clientX + scrollX
        this.y = e.clientY + scrollY

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if(this.selectedTool === "PENCIL"){
            this.currentPoints = []
            const point = {
                x: mouseX,
                y: mouseY
            }
            this.currentPoints.push(point)
            this.setLineProperties()
            this.ctx.beginPath()
            this.ctx.moveTo(point.x, point.y)
        }
        else if(this.selectedTool === "SELECT"){
            // Find if user clicked on an existing shape
            this.selectedShape = "";
            
            for (const shape of this.existingShapes) {
                if (this.isPointInShape(mouseX, mouseY, shape)) {
                    this.selectedShape = shape;
                    // Calculate offset for dragging
                    if (shape.type === "PENCIL") {
                        this.selectedOffsetX = mouseX - shape.points[0].x;
                        this.selectedOffsetY = mouseY - shape.points[0].y;
                    } else {
                        this.selectedOffsetX = mouseX - shape.x;
                        this.selectedOffsetY = mouseY - shape.y;
                    }
                    document.body.style.cursor = "move";
                    break;
                }
            }
            
            // Check for resize handles if a shape is selected
            if (this.selectedShape) {
                this.checkResizeHandles(mouseX, mouseY);
            }
            
            // Redraw to show selection
            this.redrawCanvas();
            if (this.selectedShape) {
                this.drawSelectionHandles(this.selectedShape);
            }
        }
    }

    handleMouseMove(e: MouseEvent) {
        if (!(e.target instanceof HTMLCanvasElement)) 
            return;
        
        // Account for scroll position
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (!this.clicked) {
            // Update cursor when hovering over shapes or handles
            if (this.selectedTool === "SELECT") {
                let cursorSet = false;
                
                // Check for resize handles on selected shape
                if (this.selectedShape) {
                    cursorSet = this.updateCursorForHandles(mouseX, mouseY);
                }
                
                // Check if hovering over any shape
                if (!cursorSet) {
                    for (const shape of this.existingShapes) {
                        if (this.isPointInShape(mouseX, mouseY, shape)) {
                            document.body.style.cursor = "move";
                            cursorSet = true;
                            break;
                        }
                    }
                }
                
                // Reset cursor if not over anything
                if (!cursorSet) {
                    document.body.style.cursor = "default";
                }
            }
            return;
        }

        if(this.selectedTool === "RECTANGLE"){
            const width = (e.clientX + scrollX) - this.x
            const height = (e.clientY + scrollY) - this.y
            this.redrawCanvas()
            this.drawRectangle(this.ctx, this.x, this.y, width, height, this.color, this.stroke)
        }
        else if(this.selectedTool === "CIRCLE"){
            const radiusX = (e.clientX + scrollX) - this.x
            const radiusY = (e.clientY + scrollY) - this.y
            this.redrawCanvas()
            this.drawCircle(this.ctx, this.x, this.y, radiusX, radiusY, this.color, this.stroke)
        }
        else if(this.selectedTool === "LINE"){
            const endX = e.clientX + scrollX
            const endY = e.clientY + scrollY
            this.redrawCanvas()
            this.drawLine(this.ctx, this.x, this.y, {endX, endY}, this.color, this.stroke)
        }
        else if(this.selectedTool === "ARROW"){
            const endX = e.clientX + scrollX
            const endY = e.clientY + scrollY
            this.redrawCanvas()
            this.ctx.strokeStyle = this.color
            this.ctx.beginPath()
            canvas_arrow(this.ctx, this.x, this.y, endX, endY)
            this.ctx.stroke()
        }
        else if(this.selectedTool === "PENCIL"){
            const point = {
                x: mouseX,
                y: mouseY
            }
            this.currentPoints.push(point)
            this.ctx.strokeStyle = this.color
            this.ctx.lineTo(point.x, point.y)
            this.ctx.stroke()
        }
        else if (this.selectedTool === "SELECT" && this.selectedShape) {
            // Handle shape resizing
            if (this.isResizing()) {
                this.resizeSelectedShape(mouseX, mouseY);
            }
            // Handle shape moving
            else {
                this.moveSelectedShape(mouseX, mouseY);
            }
            
            this.redrawCanvas();
            this.drawSelectionHandles(this.selectedShape);
        }
    }

    handleMouseUp(e: MouseEvent) {
        if (!this.clicked) return;
        
        // Account for scroll position
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        this.clicked = false;
        
        if (this.selectedTool === "RECTANGLE") {
            const width = (e.clientX + scrollX) - this.x;
            const height = (e.clientY + scrollY) - this.y;
            
            // Create a temporary ID for local tracking
            const tempId = `temp-${Date.now()}`;
            
            // Create the shape object
            const shapeData = {
                id: tempId,
                type: "RECTANGLE" as const,
                x: this.x,
                y: this.y,
                width,
                height,
                color: this.color,
                strokeWidth: this.stroke
            };
            
            // Add to local collection first
            this.existingShapes.push(shapeData);
            
            // Redraw canvas to show the new shape
            this.redrawCanvas();
            
            // Send to server
            const message = {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "RECTANGLE",
                    x: this.x,
                    y: this.y,
                    width,
                    height,
                    color: this.color,
                    strokeWidth: this.stroke,
                    tempId // Include tempId so we can match it when server responds
                }
            };
    
            this.socket.send(JSON.stringify(message));
        } 
        else if (this.selectedTool === "CIRCLE") {
            const radiusX = (e.clientX + scrollX) - this.x;
            const radiusY = (e.clientY + scrollY) - this.y;
            
            // Create a temporary ID for local tracking
            const tempId = `temp-${Date.now()}`;
            
            // Create the shape object
            const shapeData = {
                id: tempId,
                type: "CIRCLE" as const,
                x: this.x,
                y: this.y,
                radiusX,
                radiusY,
                color: this.color,
                strokeWidth: this.stroke
            };
            
            // Add to local collection first
            this.existingShapes.push(shapeData);
            
            // Redraw canvas to show the new shape
            this.redrawCanvas();
            
            const message = {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "CIRCLE",
                    x: this.x,
                    y: this.y,
                    radiusX,
                    radiusY,
                    color: this.color,
                    strokeWidth: this.stroke,
                    tempId
                }
            };
    
            this.socket.send(JSON.stringify(message));
        }
        else if (this.selectedTool === "LINE"){
            const endX = e.clientX + scrollX
            const endY = e.clientY + scrollY
            
            // Create a temporary ID for local tracking
            const tempId = `temp-${Date.now()}`;
            
            // Create the shape object
            const shapeData = {
                id: tempId,
                type: "LINE" as const,
                x: this.x,
                y: this.y,
                points: {
                    endX,
                    endY
                },
                color: this.color,
                strokeWidth: this.stroke
            };
            
            // Add to local collection first
            this.existingShapes.push(shapeData);
            
            // Redraw canvas to show the new shape
            this.redrawCanvas();
        
            const message = {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "LINE",
                    x: this.x,
                    y: this.y,
                    points: {
                        endX,
                        endY
                    },
                    color: this.color,
                    strokeWidth: this.stroke,
                    tempId
                }
            }

            this.socket.send(JSON.stringify(message));
        }
        else if(this.selectedTool === "ARROW"){
            const endX = e.clientX + scrollX
            const endY = e.clientY + scrollY
            
            // Create a temporary ID for local tracking
            const tempId = `temp-${Date.now()}`;
            
            // Create the shape object
            const shapeData = {
                id: tempId,
                type: "ARROW" as const,
                x: this.x,
                y: this.y,
                points: {
                    endX,
                    endY
                },
                color: this.color,
                strokeWidth: this.stroke
            };
            
            // Add to local collection first
            this.existingShapes.push(shapeData);
            
            // Redraw canvas to show the new shape
            this.redrawCanvas();
            
            const message = {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "ARROW",
                    x: this.x,
                    y: this.y,
                    points: {
                        endX,
                        endY
                    },
                    color: this.color,
                    strokeWidth: this.stroke,
                    tempId
                }
            }

            this.socket.send(JSON.stringify(message))
        }
        else if(this.selectedTool === "PENCIL"){
            // Create a temporary ID for local tracking
            const tempId = `temp-${Date.now()}`;
            
            // Create the shape object
            const shapeData = {
                id: tempId,
                type: "PENCIL" as const,
                points: this.currentPoints,
                color: this.color,
                strokeWidth: this.stroke
            };
            
            // Add to local collection first
            this.existingShapes.push(shapeData);
            
            // Redraw canvas to show the new shape
            this.redrawCanvas();
            
            const message= {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "PENCIL",
                    points: this.currentPoints,
                    color: this.color,
                    strokeWidth: this.stroke,
                    tempId
                }
            }

            this.socket.send(JSON.stringify(message));
            this.currentPoints = []
        }
        else if (this.selectedTool === "SELECT") {
            // Reset all the resize flags
            this.isTL = false;
            this.isTR = false;
            this.isBL = false;
            this.isBR = false;
            this.isELR = false;
            this.isELL = false;
            this.isELT = false;
            this.isELB = false;
            this.isLNS = false;
            this.isLNE = false;
            this.isARRS = false;
            this.isARRE = false;
            
            // Update shape on server if it was moved or resized
            if (this.selectedShape) {
                const message = {
                    type: "update",
                    roomId: this.roomId,
                    message: this.selectedShape
                };
                
                this.socket.send(JSON.stringify(message));
                
                // Redraw with selection handles
                this.redrawCanvas();
                this.drawSelectionHandles(this.selectedShape);
            }
        }
    }

    handleWheel(event: WheelEvent) {
        console.log(event)
    }

    removeShapeFromCanvas(shapeId: string) {
        console.log("before removal: ", this.existingShapes)
        this.existingShapes = this.existingShapes.filter(shape => shape.id != shapeId)
        console.log("after removal: ", this.existingShapes)
        this.redrawCanvas()
    }

    // Helper method to check if a point is inside a shape
    isPointInShape(x: number, y: number, shape: Shapes): boolean {
        if (shape.type === "RECTANGLE") {
            return (
                x >= shape.x && 
                x <= shape.x + shape.width && 
                y >= shape.y && 
                y <= shape.y + shape.height
            );
        }
        else if (shape.type === "CIRCLE") {
            // For ellipse, normalize the coordinates to check if point is inside
            const normalizedX = (x - shape.x) / Math.abs(shape.radiusX);
            const normalizedY = (y - shape.y) / Math.abs(shape.radiusY);
            return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
        }
        else if (shape.type === "LINE" || shape.type === "ARROW") {
            // Check if point is near the line segment
            const dx = shape.points.endX - shape.x;
            const dy = shape.points.endY - shape.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length === 0) return false;
            
            // Calculate projection of point onto line
            const projection = ((x - shape.x) * dx + (y - shape.y) * dy) / (length * length);
            
            // If projection is outside [0, 1], point is beyond line segment
            if (projection < 0 || projection > 1) return false;
            
            // Calculate distance from point to line
            const projX = shape.x + projection * dx;
            const projY = shape.y + projection * dy;
            const distance = Math.sqrt((x - projX) * (x - projX) + (y - projY) * (y - projY));
            
            return distance <= 5; // Tolerance of 5 pixels
        }
        else if (shape.type === "PENCIL") {
            // Check if point is near any segment of the pencil path
            for (let i = 1; i < shape.points.length; i++) {
                const point1 = shape.points[i - 1];
                const point2 = shape.points[i];
                
                const dx = point2.x - point1.x;
                const dy = point2.y - point1.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                if (length === 0) continue;
                
                // Calculate projection
                const projection = ((x - point1.x) * dx + (y - point1.y) * dy) / (length * length);
                
                if (projection < 0 || projection > 1) continue;
                
                const projX = point1.x + projection * dx;
                const projY = point1.y + projection * dy;
                const distance = Math.sqrt((x - projX) * (x - projX) + (y - projY) * (y - projY));
                
                if (distance <= 5) return true; // Tolerance of 5 pixels
            }
            return false;
        }
        else if (shape.type === "TEXT") {
            // Simple bounding box check for text
            // Assuming text height is about 16px
            return (
                x >= shape.x && 
                x <= shape.x + this.getTextWidth(shape) && 
                y >= shape.y - 16 && 
                y <= shape.y
            );
        }
        
        return false;
    }

    getTextWidth(textShape: Shapes): number {
        if (textShape.type !== "TEXT") return 0;
        
        this.ctx.font = "16px Arial";
        const text = textShape.points.map(point => point.letter).join('');
        return this.ctx.measureText(text).width;
    }

    drawSelectionHandles(shape: Shapes): void {
        if (shape.type === "RECTANGLE") {
            // Draw outline
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            
            // Draw corner handles
            this.drawHandle(shape.x, shape.y); // Top-left
            this.drawHandle(shape.x + shape.width, shape.y); // Top-right
            this.drawHandle(shape.x, shape.y + shape.height); // Bottom-left
            this.drawHandle(shape.x + shape.width, shape.y + shape.height); // Bottom-right
        }
        else if (shape.type === "CIRCLE") {
            // Draw outline
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.ellipse(shape.x, shape.y, Math.abs(shape.radiusX), Math.abs(shape.radiusY), 0, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw handle points at cardinal directions
            this.drawHandle(shape.x + shape.radiusX, shape.y); // Right
            this.drawHandle(shape.x - shape.radiusX, shape.y); // Left
            this.drawHandle(shape.x, shape.y + shape.radiusY); // Bottom
            this.drawHandle(shape.x, shape.y - shape.radiusY); // Top
        }
        else if (shape.type === "LINE" || shape.type === "ARROW") {
            // Draw endpoints
            this.drawHandle(shape.x, shape.y); // Start point
            this.drawHandle(shape.points.endX, shape.points.endY); // End point
        }
        else if (shape.type === "PENCIL") {
            // Draw bounding box around pencil path
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            for (const point of shape.points) {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
            
            this.ctx.strokeStyle = "gray";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
        }
        else if (shape.type === "TEXT") {
            const width = this.getTextWidth(shape);
            
            // Draw rectangle around text
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(shape.x, shape.y - 16, width, 16);
        }
    }

    // Draw a handle point
    drawHandle(x: number, y: number): void {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = "gray";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    // Check which resize handle the user clicked on
    checkResizeHandles(x: number, y: number): void {
        this.isTL = false;
        this.isTR = false;
        this.isBL = false;
        this.isBR = false;
        this.isELR = false;
        this.isELL = false;
        this.isELT = false;
        this.isELB = false;
        this.isLNS = false;
        this.isLNE = false;
        this.isARRS = false;
        this.isARRE = false;
        
        if (!this.selectedShape) return;
        
        const handleRadius = 6;
        
        if (this.selectedShape.type === "RECTANGLE") {
            // Check the four corners
            if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y, handleRadius)) {
                this.isTL = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x + this.selectedShape.width, this.selectedShape.y, handleRadius)) {
                this.isTR = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y + this.selectedShape.height, handleRadius)) {
                this.isBL = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x + this.selectedShape.width, this.selectedShape.y + this.selectedShape.height, handleRadius)) {
                this.isBR = true;
            }
        }
        else if (this.selectedShape.type === "CIRCLE") {
            // Check the four cardinal points
            if (this.isPointNearPoint(x, y, this.selectedShape.x + this.selectedShape.radiusX, this.selectedShape.y, handleRadius)) {
                this.isELR = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x - this.selectedShape.radiusX, this.selectedShape.y, handleRadius)) {
                this.isELL = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y + this.selectedShape.radiusY, handleRadius)) {
                this.isELT = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y - this.selectedShape.radiusY, handleRadius)) {
                this.isELB = true;
            }
        }
        else if (this.selectedShape.type === "LINE") {
            // Check endpoints
            if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y, handleRadius)) {
                this.isLNS = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.points.endX, this.selectedShape.points.endY, handleRadius)) {
                this.isLNE = true;
            }
        }
        else if (this.selectedShape.type === "ARROW") {
            // Check endpoints
            if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y, handleRadius)) {
                this.isARRS = true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.points.endX, this.selectedShape.points.endY, handleRadius)) {
                this.isARRE = true;
            }
        }
    }

    // Helper method to check if a point is near another point
    isPointNearPoint(x1: number, y1: number, x2: number, y2: number, tolerance: number): boolean {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy <= tolerance * tolerance;
    }

    // Check if currently resizing a shape
    isResizing(): boolean {
        return (
            this.isTL || this.isTR || this.isBL || this.isBR ||
            this.isELR || this.isELL || this.isELT || this.isELB ||
            this.isLNS || this.isLNE || this.isARRS || this.isARRE
        );
    }

    // Update cursor based on handle position
    updateCursorForHandles(x: number, y: number): boolean {
        if (!this.selectedShape) return false;
        
        const handleRadius = 6;
        
        if (this.selectedShape.type === "RECTANGLE") {
            // Check corners
            if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y, handleRadius) ||
                this.isPointNearPoint(x, y, this.selectedShape.x + this.selectedShape.width, this.selectedShape.y + this.selectedShape.height, handleRadius)) {
                document.body.style.cursor = "nwse-resize";
                return true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x + this.selectedShape.width, this.selectedShape.y, handleRadius) ||
                    this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y + this.selectedShape.height, handleRadius)) {
                document.body.style.cursor = "nesw-resize";
                return true;
            }
        }
        else if (this.selectedShape.type === "CIRCLE") {
            // Check cardinal points
            if (this.isPointNearPoint(x, y, this.selectedShape.x + this.selectedShape.radiusX, this.selectedShape.y, handleRadius) ||
                this.isPointNearPoint(x, y, this.selectedShape.x - this.selectedShape.radiusX, this.selectedShape.y, handleRadius)) {
                document.body.style.cursor = "ew-resize";
                return true;
            }
            else if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y + this.selectedShape.radiusY, handleRadius) ||
                    this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y - this.selectedShape.radiusY, handleRadius)) {
                document.body.style.cursor = "ns-resize";
                return true;
            }
        }
        else if (this.selectedShape.type === "LINE" || this.selectedShape.type === "ARROW") {
            // Check endpoints
            if (this.isPointNearPoint(x, y, this.selectedShape.x, this.selectedShape.y, handleRadius) ||
                this.isPointNearPoint(x, y, this.selectedShape.points.endX, this.selectedShape.points.endY, handleRadius)) {
                document.body.style.cursor = "pointer";
                return true;
            }
        }
        
        return false;
    }

    // Move the selected shape
    moveSelectedShape(mouseX: number, mouseY: number): void {
        if (!this.selectedShape) return;
        
        if (this.selectedShape.type === "RECTANGLE") {
            this.selectedShape.x = mouseX - this.selectedOffsetX;
            this.selectedShape.y = mouseY - this.selectedOffsetY;
        }
        else if (this.selectedShape.type === "CIRCLE") {
            this.selectedShape.x = mouseX - this.selectedOffsetX;
            this.selectedShape.y = mouseY - this.selectedOffsetY;
        }
        else if (this.selectedShape.type === "LINE" || this.selectedShape.type === "ARROW") {
            const dx = mouseX - this.selectedOffsetX - this.selectedShape.x;
            const dy = mouseY - this.selectedOffsetY - this.selectedShape.y;
            
            this.selectedShape.x = mouseX - this.selectedOffsetX;
            this.selectedShape.y = mouseY - this.selectedOffsetY;
            this.selectedShape.points.endX += dx;
            this.selectedShape.points.endY += dy;
        }
        else if (this.selectedShape.type === "PENCIL") {
            const dx = mouseX - this.selectedOffsetX - this.selectedShape.points[0].x;
            const dy = mouseY - this.selectedOffsetY - this.selectedShape.points[0].y;
            
            // Move all points
            for (const point of this.selectedShape.points) {
                point.x += dx;
                point.y += dy;
            }
            
            // Update offset for continuous movement
            this.selectedOffsetX = mouseX - this.selectedShape.points[0].x;
            this.selectedOffsetY = mouseY - this.selectedShape.points[0].y;
        }
        else if (this.selectedShape.type === "TEXT") {
            this.selectedShape.x = mouseX - this.selectedOffsetX;
            this.selectedShape.y = mouseY - this.selectedOffsetY;
        }
    }

    // Resize the selected shape
    resizeSelectedShape(mouseX: number, mouseY: number): void {
        if (!this.selectedShape) return;
        
        if (this.selectedShape.type === "RECTANGLE") {
            if (this.isTL) {
                const newWidth = this.selectedShape.x + this.selectedShape.width - mouseX;
                const newHeight = this.selectedShape.y + this.selectedShape.height - mouseY;
                
                if (newWidth > 0) {
                    this.selectedShape.x = mouseX;
                    this.selectedShape.width = newWidth;
                }
                
                if (newHeight > 0) {
                    this.selectedShape.y = mouseY;
                    this.selectedShape.height = newHeight;
                }
            }
            else if (this.isTR) {
                const newWidth = mouseX - this.selectedShape.x;
                const newHeight = this.selectedShape.y + this.selectedShape.height - mouseY;
                
                if (newWidth > 0) {
                    this.selectedShape.width = newWidth;
                }
                
                if (newHeight > 0) {
                    this.selectedShape.y = mouseY;
                    this.selectedShape.height = newHeight;
                }
            }
            else if (this.isBL) {
                const newWidth = this.selectedShape.x + this.selectedShape.width - mouseX;
                const newHeight = mouseY - this.selectedShape.y;
                
                if (newWidth > 0) {
                    this.selectedShape.x = mouseX;
                    this.selectedShape.width = newWidth;
                }
                
                if (newHeight > 0) {
                    this.selectedShape.height = newHeight;
                }
            }
            else if (this.isBR) {
                const newWidth = mouseX - this.selectedShape.x;
                const newHeight = mouseY - this.selectedShape.y;
                
                if (newWidth > 0) {
                    this.selectedShape.width = newWidth;
                }
                
                if (newHeight > 0) {
                    this.selectedShape.height = newHeight;
                }
            }
        }
        else if (this.selectedShape.type === "CIRCLE") {
            if (this.isELR) {
                this.selectedShape.radiusX = mouseX - this.selectedShape.x;
            }
            else if (this.isELL) {
                this.selectedShape.radiusX = this.selectedShape.x - mouseX;
            }
            else if (this.isELT) {
                this.selectedShape.radiusY = mouseY - this.selectedShape.y;
            }
            else if (this.isELB) {
                this.selectedShape.radiusY = this.selectedShape.y - mouseY;
            }
        }
        else if (this.selectedShape.type === "LINE") {
            if (this.isLNS) {
                this.selectedShape.x = mouseX;
                this.selectedShape.y = mouseY;
            }
            else if (this.isLNE) {
                this.selectedShape.points.endX = mouseX;
                this.selectedShape.points.endY = mouseY;
            }
        }
        else if (this.selectedShape.type === "ARROW") {
            if (this.isARRS) {
                this.selectedShape.x = mouseX;
                this.selectedShape.y = mouseY;
            }
            else if (this.isARRE) {
                this.selectedShape.points.endX = mouseX;
                this.selectedShape.points.endY = mouseY;
            }
        }
    }

    setLineProperties() {
        this.ctx.lineWidth = this.stroke;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        return this.ctx;
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const shape of this.existingShapes) {
            this.drawShape(shape);
        }
    }

    drawShape(shape: Shapes) {
        this.ctx.strokeStyle = shape.color || this.color;
        // Apply strokeWidth if available, otherwise use default
        this.ctx.lineWidth = shape.strokeWidth || this.stroke;
        
        if(shape.type === "RECTANGLE"){
            this.drawRectangle(this.ctx, shape.x, shape.y, shape.width, shape.height, shape.color, shape.strokeWidth);
        }
        else if(shape.type === "CIRCLE"){
            this.drawCircle(this.ctx, shape.x, shape.y, shape.radiusX, shape.radiusY, shape.color, shape.strokeWidth);
        }
        else if(shape.type === "LINE"){
            this.drawLine(this.ctx, shape.x, shape.y, shape.points, shape.color, shape.strokeWidth);
        }
        else if(shape.type === "ARROW"){
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = shape.strokeWidth || this.stroke;
            this.ctx.beginPath();
            canvas_arrow(this.ctx, shape.x, shape.y, shape.points.endX, shape.points.endY);
            this.ctx.stroke();
        }
        else if(shape.type === "PENCIL"){
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = shape.strokeWidth || this.stroke;
            if(shape.points && shape.points.length > 0){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for(let i=1; i<shape.points.length; i++){
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                this.ctx.stroke();
            }
        }
        else if(shape.type === "TEXT"){
            this.ctx.font = "16px Arial";
            this.ctx.fillStyle = shape.color || this.color;
            const text = shape.points.map(point => point.letter).join('');
            this.ctx.fillText(text, shape.x, shape.y);
        }
    }

    drawRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color?: string, strokeWidth?: number){
        ctx.strokeStyle = color as string;
        ctx.lineWidth = strokeWidth || this.stroke;
        ctx.strokeRect(x, y, width, height);
    }

    drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, color?: string, strokeWidth?: number){
        ctx.strokeStyle = color as string;
        ctx.lineWidth = strokeWidth || this.stroke;
        ctx.beginPath();
        ctx.ellipse(x, y, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI*2);
        ctx.stroke();
        ctx.closePath();
    }

    drawLine(ctx: CanvasRenderingContext2D, x: number, y: number, points: {endX: number, endY: number}, color?: string, strokeWidth?: number){
        ctx.strokeStyle = color as string;
        ctx.lineWidth = strokeWidth || this.stroke;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(points.endX, points.endY);
        ctx.stroke();
    }

    socketHandler(){
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if(message.type === "draw"){
                const shape = message.message
                
                // Check if this shape has a tempId (meaning it was drawn by this user)
                if (shape.tempId) {
                    // Find the temporary shape in our array
                    const tempIndex = this.existingShapes.findIndex(s => s.id === shape.tempId);
                    if (tempIndex >= 0) {
                        // Update the temporary shape with the server-assigned ID
                        this.existingShapes[tempIndex].id = shape.id;
                        // Continue with the rest of the function to avoid duplication
                        return;
                    }
                }
                
                // If not our own shape or not found with tempId, create a new shape
                let newShape: Shapes;
                if (shape.type === "RECTANGLE") {
                    newShape = {
                        id: shape.id,
                        type: "RECTANGLE" as const,
                        x: shape.x,
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(newShape);
                } 
                else if (shape.type === "CIRCLE") {
                    newShape = {
                        id: shape.id,
                        type: "CIRCLE" as const,
                        x: shape.x,
                        y: shape.y,
                        radiusX: shape.radiusX,
                        radiusY: shape.radiusY,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(newShape);
                }
                else if(shape.type === "LINE"){
                    newShape = {
                        id: shape.id,
                        type: "LINE",
                        x: shape.x,
                        y: shape.y,
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(newShape);
                }
                else if(shape.type === "ARROW"){
                    newShape = {
                        id: shape.id,
                        type: "ARROW",
                        x: shape.x,
                        y: shape.y,
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(newShape);
                }
                else if(shape.type === "PENCIL"){
                    newShape = {
                        id: shape.id,
                        type: "PENCIL",
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(newShape);
                }
                else if(shape.type === "TEXT"){
                    newShape = {
                        id: shape.id,
                        type: "TEXT",
                        x: shape.x,
                        y: shape.y,
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(newShape);
                }
                else {
                    console.warn("Received invalid shape:", shape)
                    return;
                }
                this.redrawCanvas();
            }
            else if(message.type === "update"){
                const shape = message.message
                const shapeId = shape.id
                this.removeShapeFromCanvas(shapeId)
                let updatedShape: Shapes;
                if (shape.type === "RECTANGLE") {
                    updatedShape = {
                        id: shape.id,
                        type: "RECTANGLE" as const,
                        x: shape.x,
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(updatedShape);
                } 
                else if (shape.type === "CIRCLE") {
                    updatedShape = {
                        id: shape.id,
                        type: "CIRCLE" as const,
                        x: shape.x,
                        y: shape.y,
                        radiusX: shape.radiusX,
                        radiusY: shape.radiusY,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(updatedShape);
                }
                else if(shape.type === "LINE"){
                    updatedShape = {
                        id: shape.id,
                        type: "LINE",
                        x: shape.x,
                        y: shape.y,
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(updatedShape);
                }
                else if(shape.type === "ARROW"){
                    updatedShape = {
                        id: shape.id,
                        type: "ARROW",
                        x: shape.x,
                        y: shape.y,
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(updatedShape);
                }
                else if(shape.type === "PENCIL"){
                    updatedShape = {
                        id: shape.id,
                        type: "PENCIL",
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(updatedShape);
                }
                else if(shape.type === "TEXT"){
                    updatedShape = {
                        id: shape.id,
                        type: "TEXT",
                        x: shape.x,
                        y: shape.y,
                        points: shape.points,
                        color: shape.color,
                        strokeWidth: shape.strokeWidth
                    }
                    this.existingShapes.push(updatedShape);
                }
                else {
                    console.warn("Received invalid shape:", shape)
                    return;
                }
                this.redrawCanvas();
                
                // If the updated shape is selected, update our selection reference
                if (this.selectedShape && typeof this.selectedShape === 'object' && 
                    'id' in this.selectedShape && this.selectedShape.id && 
                    this.selectedShape.id === shapeId) {
                    this.selectedShape = updatedShape;
                    this.drawSelectionHandles(this.selectedShape);
                }
            }
        }
    }

    // Public methods for external control
    public setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    public setColor(color: Color) {
        this.color = color;
    }

    public setStroke(stroke: Stroke) {
        this.stroke = stroke;
    }

}

function canvas_arrow(context: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
    const headlen = 10; // length of head in pixels
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}