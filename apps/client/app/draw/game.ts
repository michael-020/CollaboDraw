import { json } from "stream/consumers"
import { getExistingShapes } from "./http"
import { Tool } from "@/components/Canvas"

export type Shapes = {
    type: "RECTANGLE",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "CIRCLE",
    x: number, 
    y: number, 
    radiusX: number,
    radiusY: number
} | {
    type: "LINE",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    }
} | {
    type: "ARROW",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    }
} | {
    type: "PENCIL"
}


export class Game{
    private roomId: string
    private socket: WebSocket
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private existingShapes: Shapes[]
    private clicked: boolean
    private x = 0
    private y = 0
    private selectedTool: Tool | "" = ""
    private shouldDraw = false
    private MAIN_MOUSE_BUTTON = 0;

    constructor(roomId: string, socket: WebSocket, canvas: HTMLCanvasElement){
        this.roomId = roomId,
        this.socket = socket
        this.canvas = canvas,
        this.ctx = canvas.getContext("2d")!
        this.existingShapes = []
        this.clicked = false
        this.init()
        this.socketHandler()
        this.mouseEventHandler()
    }

    async init(){

        this.existingShapes = await getExistingShapes(this.roomId)

        this.clearCanvas()
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.strokeStyle = "rgb(255,255,255)"

        this.existingShapes.forEach(shape => {
            if(shape.type === "RECTANGLE"){
                const rectShape = shape as Extract<Shapes, { type: "RECTANGLE" }>
                this.ctx.strokeRect(rectShape.x, rectShape.y, rectShape.width, rectShape.height)

            }
            else if(shape.type === "CIRCLE"){
                const circleShape = shape as Extract<Shapes, { type: "CIRCLE" }>
                this.ctx.beginPath()
                this.ctx.ellipse(
                    circleShape.x, 
                    circleShape.y, 
                    Math.abs(circleShape.radiusX), 
                    Math.abs(circleShape.radiusY), 
                    0, 
                    0, 
                    Math.PI * 2
                )
                this.ctx.stroke()
                this.ctx.closePath();

            }
            else if(shape.type === "LINE"){
                // this.clearCanvas()
                this.ctx.beginPath()
                this.ctx.moveTo(shape.x, shape.y)

                this.ctx.lineTo(shape.points.endX, shape.points.endY)
                this.ctx.stroke()
                // this.ctx.closePath();
            }
            else if(shape.type === "ARROW"){
                this.ctx.beginPath()
                canvas_arrow(this.ctx, shape.x, shape.y, shape.points.endX, shape.points.endY)
                this.ctx.stroke()
            }
        })
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
                    height: shape.height
                }

                this.existingShapes.push(rectangleShape)
            } 
            else if (shape.type === "CIRCLE") {
                const circleShape = {
                    type: "CIRCLE" as const,
                    x: shape.x,
                    y: shape.y,
                    radiusX: shape.radiusX,
                    radiusY: shape.radiusY
                }

                this.existingShapes.push(circleShape)
            }
            else if(shape.type === "LINE"){
                // console.log("message: ",message)
                const line: Shapes = {
                    type: "LINE",
                    x: shape.x,
                    y: shape.y,
                    points: shape.points
                }
                // console.log("line: ", line)
                this.existingShapes.push(line)
            }
            else if(shape.type === "ARROW"){
                const arrow: Shapes = {
                    type: "ARROW",
                    x: shape.x,
                    y: shape.y,
                    points: shape.points
                }
                this.existingShapes.push(arrow)
            }
            else {
                console.warn("Received invalid shape:", shape)
            }
            this.clearCanvas()
        }
    }

    mousedownHandler(e: MouseEvent){
        this.clicked = true
        this.x = e.clientX
        this.y = e.clientY
    }

    mousemoveHandler(e: MouseEvent){
        if(!this.clicked)
            return
        this.ctx.strokeStyle = "rgb(255,255,255)"
        if(this.selectedTool === "RECTANGLE"){
            const width = e.clientX - this.x
            const height = e.clientY - this.y
            this.clearCanvas()
            this.ctx.strokeRect(this.x, this.y, width, height)
        }
        else if(this.selectedTool === "CIRCLE"){
            const radiusX = e.clientX - this.x
            const radiusY = e.clientY - this.y
            this.clearCanvas()
            this.ctx.beginPath();
            this.ctx.ellipse(this.x, this.y, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI*2);
            this.ctx.stroke();
        }
        else if(this.selectedTool === "LINE"){
            const endX = e.clientX
            const endY = e.clientY
            this.clearCanvas()
            this.ctx.beginPath()
            this.ctx.moveTo(this.x, this.y)
            this.ctx.lineTo(endX, endY)
            this.ctx.stroke()
        }
        else if(this.selectedTool === "ARROW"){
            const endX = e.clientX
            const endY = e.clientY
            this.clearCanvas()
            this.ctx.beginPath()
            canvas_arrow(this.ctx, this.x, this.y, endX, endY)
            this.ctx.stroke()
        }
        
    }

    mouseupHandler(e: MouseEvent) {
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
                    height
                }
            };
    
            this.existingShapes.push(message.message as Shapes);
            this.clearCanvas();
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
                    radiusY
                }
            };
    
            this.existingShapes.push(message.message as Shapes);
            this.clearCanvas();
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
                    }
                }
            }

            this.existingShapes.push(message.message as Shapes);
            this.clearCanvas();
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
                    }
                }
            }
            console.log("shapes arrow: ", message.message)
            this.existingShapes.push(message.message as Shapes)
            this.clearCanvas()
            this.socket.send(JSON.stringify(message))
        }
    }

    mouseEventHandler(){
        this.canvas.addEventListener("mousedown", this.mousedownHandler.bind(this))
        this.canvas.addEventListener("mousemove", this.mousemoveHandler.bind(this))
        this.canvas.addEventListener("mouseup", this.mouseupHandler.bind(this))
    }

    setTool(tool: Tool){
        this.selectedTool = tool
    }

    setLineProperties(context: CanvasRenderingContext2D) {
        context.lineWidth = 4;
        context.lineJoin = "round";
        context.lineCap = "round";
        return context;
      }

    start(event: any) {
        if (event.button === this.MAIN_MOUSE_BUTTON) {
          this.shouldDraw = true;
          this.setLineProperties(this.ctx);
      
          this.ctx.beginPath();
          
          let elementRect = event.target.getBoundingClientRect();
          this.ctx.moveTo(event.clientX - elementRect.left, event.clientY - elementRect.top);
        }
      }
      
      end(event: any) {
        if (event.button === this.MAIN_MOUSE_BUTTON) {
          this.shouldDraw = false;
        }
      }
      
      move(event: any) {
        if (this.shouldDraw) {
            let elementRect = event.target.getBoundingClientRect();
          this.ctx.lineTo(event.clientX - elementRect.left, event.clientY - elementRect.top);
          this.ctx.stroke()
        }
      }

    destroy(){
        this.canvas.removeEventListener("mousedown", this.mousedownHandler)

        this.canvas.removeEventListener("mouseup",this.mouseupHandler)

        this.canvas.removeEventListener("mousemove", this.mousemoveHandler)
    }
}

function canvas_arrow(context: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  }