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
    type: "LINE"
} | {
    type: "ARROW"
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
    private selectedTool = "CIRCLE"

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

        this.existingShapes.map(shape => {
            if(shape.type === "RECTANGLE"){
                this.ctx.strokeStyle = "rgb(255,255,255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            }
            else if(shape.type === "CIRCLE"){
                this.ctx.strokeStyle = "rgb(255,255,255)"
                this.ctx.beginPath();
                this.ctx.ellipse(shape.x, shape.y, Math.abs(shape.radiusX), Math.abs(shape.radiusY), 0, 0, Math.PI*2);
                this.ctx.stroke();
            }
        })
    }

    socketHandler(){
        this.socket.onmessage = (event) => {

            const message = JSON.parse(event.data)

            const shape = message.message

            this.existingShapes.push(shape)
            this.clearCanvas()
        }
    }

    mousedownHandler(e: MouseEvent){
        this.clicked = true
        this.x = e.clientX
        this.y = e.clientY
        console.log("selectedTool: ", this.selectedTool)
    }

    mousemoveHandler(e: MouseEvent){
        if(!this.clicked)
            return

        if(this.selectedTool === "RECTANGLE"){
            const width = e.clientX - this.x
            const height = e.clientY - this.y
            this.clearCanvas()
            this.ctx.strokeStyle = "rgb(255,255,255)"
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
        
    }

    mouseupHandler(e: MouseEvent){
        if(!this.clicked)
            return

        this.clicked = false
        if(this.selectedTool === "RECTANGLE"){
            const width = e.clientX - this.x
            const height = e.clientY - this.y
            // this.ctx.strokeRect(this.x, this.y, width, height)
            const shape: Shapes = {
                type: "RECTANGLE",
                x: this.x,
                y: this.y,
                width,
                height
            }

            this.existingShapes.push(shape)
            this.clearCanvas()

            this.socket.send(JSON.stringify({
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "RECTANGLE",
                    x: this.x,
                    y: this.y,
                    width,
                    height
                }
            }))
        } 
        else if(this.selectedTool === "CIRCLE"){
            const radiusX = e.clientX - this.x
            const radiusY = e.clientY - this.y
            
            // this.ctx.beginPath();
            // this.ctx.ellipse(100, 100, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI*2);
            // this.ctx.stroke();

            const shape: Shapes = {
                type: "CIRCLE",
                x: this.x,
                y: this.y,
                radiusX,
                radiusY
            }

            this.existingShapes.push(shape)
            this.clearCanvas()

            this.socket.send(JSON.stringify({
                type: "draw",
                roomId: this.roomId,
                message: {
                    type: "CIRCLE",
                    x: this.x,
                    y: this.y,
                    radiusX,
                    radiusY
                }
            }))
        }
        
    }

    mouseEventHandler(){
        this.canvas.addEventListener("mousedown", this.mousedownHandler.bind(this))
        this.canvas.addEventListener("mousemove", this.mousemoveHandler.bind(this))
        this.canvas.addEventListener("mouseup", this.mouseupHandler.bind(this))
    }

    setTool(tool: Tool){
        console.log("tool changed")
        this.selectedTool = tool
    }

    destroy(){
        this.canvas.removeEventListener("mousedown", this.mousedownHandler)

        this.canvas.removeEventListener("mouseup",this.mouseupHandler)

        this.canvas.removeEventListener("mousemove", this.mousemoveHandler)
    }
}