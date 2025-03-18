import { createClient } from "redis";

const client = createClient();
const main = async () => {
    await client.connect();
}
main()

export type Shapes = {
    type: "RECTANGLE",
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string
} | {
    type: "CIRCLE",
    x: number, 
    y: number, 
    radiusX: number,
    radiusY: number,
    color?: string
} | {
    type: "LINE",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color?: string
} | {
    type: "ARROW",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color?: string
} | {
    type: "PENCIL",
    points: Array<{x: number, y: number}>,
    color?: string
} | {
    type: "TEXT",
    x: number,
    y: number,
    points: Array<{letter: string}>,
    color?: string
}

export async function pushShape(shape: Shapes){
    await client.lPush("shapes", JSON.stringify(shape));
    console.log("Pushed Shape: ", shape)
}

export async function popShape(){
    await client.brPop("shapes", 0);
    console.log("")
}
