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
    type: "PENCIL",
    points: Array<{x: number, y: number}> 
} | {
    type: "TEXT",
    x: number,
    y: number,
    points: Array<{letter: string}>
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
    private currentPoints: Array<{x: number, y: number}> = []
    private callbacks: {
        onTextStart: (x: number, y: number) => void
        onTextEnd: (x: number, y: number) => void
    }
    private texts: Array<{text: string, x: number, y: number}> = []

    constructor(roomId: string, socket: WebSocket, canvas: HTMLCanvasElement, callbacks: {
        onTextStart: (x: number, y: number) => void;
        onTextEnd: (x: number, y: number) => void;
    }){
        this.roomId = roomId
        this.socket = socket
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")!
        this.existingShapes = []
        this.clicked = false
        this.callbacks = callbacks
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
            else if(shape.type === "PENCIL"){
                if(shape.points && shape.points.length > 0){
                    this.ctx.beginPath()
                    this.ctx.moveTo(shape.points[0].x, shape.points[0].y)
                    for(let i=1; i<shape.points.length; i++){
                        this.ctx.lineTo(shape.points[i].x, shape.points[i].y)
                    }
                    this.ctx.stroke()
                }
            }
            else if(shape.type === "TEXT"){
                this.ctx.font = "16px Arial"
                this.ctx.fillStyle = "rgb(255,255,255)"
                const text = shape.points.map(point => point.letter).join('')
                this.ctx.fillText(text, shape.x, shape.y)
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
            else if(shape.type === "PENCIL"){
                const pencil: Shapes = {
                    type: "PENCIL",
                    points: shape.points
                }
                this.existingShapes.push(pencil)
            }
            else if(shape.type === "TEXT"){
                const textShape: Shapes = {
                    type: "TEXT",
                    x: shape.x,
                    y: shape.y,
                    points: shape.points
                }
                this.existingShapes.push(textShape)
            }
            else {
                console.warn("Received invalid shape:", shape)
            }
            this.clearCanvas()
        }
    }

    mousedownHandler(e: MouseEvent){
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
        else if(this.selectedTool === "TEXT"){
            // this.ctx.font = "28px Arial"
            // this.ctx.fillStyle = "rgb(255,255,255)"
            // this.ctx.fillText("hello", this.x, this.y)
            this.callbacks.onTextStart(e.clientX, e.clientY)
        }
    }

    mousemoveHandler(e: MouseEvent){
        if (!(e.target instanceof HTMLCanvasElement)) 
            return;
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
        else if(this.selectedTool === "PENCIL"){
            const elementRect = e.target.getBoundingClientRect()
            const point = {
                x: e.clientX - elementRect.left,
                y: e.clientY - elementRect.top
            }
            this.currentPoints.push(point)
            this.ctx.lineTo(point.x, point.y)
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

            this.existingShapes.push(message.message as Shapes)
            this.clearCanvas()
            this.socket.send(JSON.stringify(message))
        }
        else if(this.selectedTool === "PENCIL"){
            const message= {
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "PENCIL",
                    points: this.currentPoints
                }
            }

            this.existingShapes.push(message.message as Shapes)
            this.socket.send(JSON.stringify(message));
            this.currentPoints = []
            console.log(this.existingShapes)
        }
        else if(this.selectedTool === "TEXT"){
            this.callbacks.onTextEnd(this.x, this.y)
        }
    }

    addText(text: string, x: number, y: number){
        const letters = text.split('').map(letter => ({ letter }))
        
        const message = {
            type: "draw",
            roomId: this.roomId,
            message: {
                type: "TEXT",
                x,
                y,
                points: letters
            }
        }

        this.existingShapes.push(message.message as Shapes)
        this.socket.send(JSON.stringify(message))
        this.clearCanvas()
    }

    // drawAllTexts(){
    //     this.ctx.font = "28px Arial"
    //     this.ctx.fillStyle = "rgb(255,255,255)"
    //     this.texts.forEach(({text, x, y}) => {
    //         this.ctx.fillText(text, x, y)
    //     })
    // }

    mouseEventHandler(){
        this.canvas.addEventListener("mousedown", this.mousedownHandler.bind(this))
        this.canvas.addEventListener("mousemove", this.mousemoveHandler.bind(this))
        this.canvas.addEventListener("mouseup", this.mouseupHandler.bind(this))
    }

    setTool(tool: Tool){
        this.selectedTool = tool
    }

    setLineProperties() {
        this.ctx.lineWidth = 1;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        return this.ctx;
    }


    destroy(){
        this.canvas.removeEventListener("mousedown", this.mousedownHandler)

        this.canvas.removeEventListener("mouseup",this.mouseupHandler)

        this.canvas.removeEventListener("mousemove", this.mousemoveHandler)
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