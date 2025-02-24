import { Color, Stroke, Tool } from "@/hooks/useDraw";
import { getExistingShapes } from "./http";

export type Shapes = {
    type: "RECTANGLE",
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
} | {
    type: "CIRCLE",
    x: number, 
    y: number, 
    radiusX: number,
    radiusY: number,
    color: string
} | {
    type: "LINE",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color: string
} | {
    type: "ARROW",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color: string
} | {
    type: "PENCIL",
    points: Array<{x: number, y: number}>,
    color: string
} | {
    type: "TEXT",
    x: number,
    y: number,
    points: Array<{letter: string}>,
    color: string
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
    private selectedOffsetX: number = 0;
    private selectedOffsetY: number = 0;

    // Zoom/Scale properties
    private scale: number = 1;
    private minScale: number = 0.5;
    private maxScale: number = 2;
    private offsetX: number = 0;
    private offsetY: number = 0;

    // Corner detection flags
    private isTL: boolean = false;
    private isTR: boolean = false;
    private isBL: boolean = false;
    private isBR: boolean = false;
    private isELR: boolean = false;
    private isELL: boolean = false;
    private isELT: boolean = false;
    private isELB: boolean = false;
    private isLNS: boolean = false;
    private isLNE: boolean = false;
    private isARRS: boolean = false;
    private isARRE: boolean = false;

    constructor(socket: WebSocket, roomId: string, canvas: HTMLCanvasElement, tool: Tool, color: Color, stroke: Stroke | number) {
        this.socket = socket
        this.roomId = roomId
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.selectedTool = tool,
        this.color = color,
        this.stroke = 1
        this.existingShapes = []
        this.loadExistingShapes();
        this.socketHandler()
        this.initializeEventListeners();
    }

    async loadExistingShapes() {
        this.existingShapes = await getExistingShapes(this.roomId)
        console.log("existing Shapes: ", this.existingShapes)
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
        this.x = e.clientX
        this.y = e.clientY
        if(this.selectedTool === "PENCIL"){
            this.currentPoints = []
            const elementRect = e.target.getBoundingClientRect()
            const point = {
                x: e.clientX - elementRect.left,
                y: e.clientY - elementRect.top
            }
            this.currentPoints.push(point)
            this.setLineProperties()
            this.ctx.beginPath()
            this.ctx.moveTo(point.x, point.y)
        }
    }

    handleMouseMove(e: MouseEvent) {
        if (!(e.target instanceof HTMLCanvasElement)) 
            return;
        if(!this.clicked)
            return

        if(this.selectedTool === "RECTANGLE"){
            const width = e.clientX - this.x
            const height = e.clientY - this.y
            this.redrawCanvas()
            this.ctx.strokeStyle = this.color
            this.ctx.strokeRect(this.x, this.y, width, height)
        }
        else if(this.selectedTool === "CIRCLE"){
            const radiusX = e.clientX - this.x
            const radiusY = e.clientY - this.y
            this.redrawCanvas()
            this.ctx.strokeStyle = this.color
            this.ctx.beginPath();
            this.ctx.ellipse(this.x, this.y, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI*2);
            this.ctx.stroke();
        }
        else if(this.selectedTool === "LINE"){
            const endX = e.clientX
            const endY = e.clientY
            this.redrawCanvas()
            this.ctx.strokeStyle = this.color
            this.ctx.beginPath()
            this.ctx.moveTo(this.x, this.y)
            this.ctx.lineTo(endX, endY)
            this.ctx.stroke()
        }
        else if(this.selectedTool === "ARROW"){
            const endX = e.clientX
            const endY = e.clientY
            this.redrawCanvas()
            this.ctx.strokeStyle = this.color
            this.ctx.beginPath()
            canvas_arrow(this.ctx, this.x, this.y, endX, endY)
            this.ctx.stroke()
        }
        else if(this.selectedTool === "PENCIL"){
            const elementRect = e.target.getBoundingClientRect()
            const point = {
                x: e.clientX - elementRect.left,
                y: e.clientY - elementRect.top
            }
            this.currentPoints.push(point)
            this.ctx.strokeStyle = this.color
            this.ctx.lineTo(point.x, point.y)
            this.ctx.stroke()
        }
    }

    handleMouseUp(e: MouseEvent) {
        if (!this.clicked) return;
    
        this.clicked = false;
        
        if (this.selectedTool === "RECTANGLE") {
            const width = e.clientX - this.x;
            const height = e.clientY - this.y;
            
            const message = {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "RECTANGLE",
                    x: this.x,
                    y: this.y,
                    width,
                    height,
                    color: this.color
                }
            };
    
            this.existingShapes.push(message.message as Shapes);
            this.redrawCanvas();
            this.socket.send(JSON.stringify(message));
        } 
        else if (this.selectedTool === "CIRCLE") {
            const radiusX = e.clientX - this.x;
            const radiusY = e.clientY - this.y;
            
            const message = {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "CIRCLE",
                    x: this.x,
                    y: this.y,
                    radiusX,
                    radiusY,
                    color: this.color
                }
            };
    
            this.existingShapes.push(message.message as Shapes);
            this.redrawCanvas();
            this.socket.send(JSON.stringify(message));
        }
        else if (this.selectedTool === "LINE"){
            const endX = e.clientX
            const endY = e.clientY
        
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
                    color: this.color
                }
            }

            this.existingShapes.push(message.message as Shapes);
            this.redrawCanvas();
            this.socket.send(JSON.stringify(message));
        }
        else if(this.selectedTool === "ARROW"){
            const endX = e.clientX
            const endY = e.clientY
            
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
                    color: this.color
                }
            }

            this.existingShapes.push(message.message as Shapes)
            this.redrawCanvas()
            this.socket.send(JSON.stringify(message))
        }
        else if(this.selectedTool === "PENCIL"){
            const message= {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "PENCIL",
                    points: this.currentPoints,
                    color: this.color
                }
            }

            this.existingShapes.push(message.message as Shapes)
            this.socket.send(JSON.stringify(message));
            this.currentPoints = []
        }
    }

    handleWheel(event: WheelEvent) {

    }

    setLineProperties() {
        this.ctx.lineWidth = 1;
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
        this.ctx.strokeStyle = this.color
        if(shape.type === "RECTANGLE"){
            this.ctx.strokeStyle = shape.color
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        else if(shape.type === "CIRCLE"){
            this.ctx.strokeStyle = shape.color
            this.ctx.beginPath();
            this.ctx.ellipse(shape.x, shape.y, Math.abs(shape.radiusX), Math.abs(shape.radiusY), 0, 0, Math.PI*2);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        else if(shape.type === "LINE"){
            this.ctx.strokeStyle = shape.color
            this.ctx.beginPath();
            this.ctx.moveTo(shape.x, shape.y);
            this.ctx.lineTo(shape.points.endX, shape.points.endY);
            this.ctx.stroke();
        }
        else if(shape.type === "ARROW"){
            this.ctx.strokeStyle = shape.color
            this.ctx.beginPath();
            canvas_arrow(this.ctx, shape.x, shape.y, shape.points.endX, shape.points.endY);
            this.ctx.stroke();
        }
        else if(shape.type === "PENCIL"){
            this.ctx.strokeStyle = shape.color
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
            this.ctx.fillStyle = this.color;
            const text = shape.points.map(point => point.letter).join('');
            this.ctx.fillText(text, shape.x, shape.y);
        }
    }

    socketHandler(){
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            const shape = message.message

            if (shape.type === "RECTANGLE") {
                const rectangleShape = {
                    type: "RECTANGLE" as const,
                    x: shape.x,
                    y: shape.y,
                    width: shape.width,
                    height: shape.height,
                    color: shape.color
                }

                this.existingShapes.push(rectangleShape)
            } 
            else if (shape.type === "CIRCLE") {
                const circleShape = {
                    type: "CIRCLE" as const,
                    x: shape.x,
                    y: shape.y,
                    radiusX: shape.radiusX,
                    radiusY: shape.radiusY,
                    color: shape.color
                }

                this.existingShapes.push(circleShape)
            }
            else if(shape.type === "LINE"){
                const line: Shapes = {
                    type: "LINE",
                    x: shape.x,
                    y: shape.y,
                    points: shape.points,
                    color: shape.color
                }
                this.existingShapes.push(line)
            }
            else if(shape.type === "ARROW"){
                const arrow: Shapes = {
                    type: "ARROW",
                    x: shape.x,
                    y: shape.y,
                    points: shape.points,
                    color: shape.color
                }
                this.existingShapes.push(arrow)
            }
            else if(shape.type === "PENCIL"){
                const pencil: Shapes = {
                    type: "PENCIL",
                    points: shape.points,
                    color: shape.color
                }
                this.existingShapes.push(pencil)
            }
            else if(shape.type === "TEXT"){
                
                const textShape: Shapes = {
                    type: "TEXT",
                    x: shape.x,
                    y: shape.y,
                    points: shape.points,
                    color: shape.color
                }
                this.existingShapes.push(textShape)
                this.redrawCanvas()
            }
            else {
                console.warn("Received invalid shape:", shape)
            }
            this.redrawCanvas()
        }
    }

    // Public methods for external control
    public setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    public setColor(color: Color) {
        this.color = color;
        console.log("color: ", this.color)
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