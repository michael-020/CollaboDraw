import { getExistingShapes } from "./http"

export type Shapes = {
    type: "rect",
    startX: number,
    startY: number,
    width: number,
    height: number
}

export class Game{
    private roomId: string
    private socket: WebSocket
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private existingShapes: []

    constructor(roomId: string, socket: WebSocket, canvas: HTMLCanvasElement){
        this.roomId = roomId,
        this.socket = socket
        this.canvas = canvas,
        this.ctx = canvas.getContext("2d")!
        this.existingShapes = []
        this.init()
        this.socketHandler()
        this.mouseEventHandler()
    }

    async init(){
        this.existingShapes = await getExistingShapes(this.roomId)
        this.clearCavas()
    }

    clearCavas(){

    }

    socketHandler(){

    }

    mouseEventHandler(){

    }
}