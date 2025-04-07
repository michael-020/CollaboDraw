import { createClient } from "redis";
import { prismaClient } from "@repo/db/client";

const client = createClient();
let queueProcessorActive = false;
let processorInterval: NodeJS.Timeout | null = null;

// Initialize Redis connection
const main = async () => {
    await client.connect();
    // Start the queue processor immediately
    startQueueProcessor();
}
main();

export type Shapes = {
    id: string, // Unique identifier for the shape
    roomId: string,
    userId: string,
    type: "RECTANGLE",
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string,
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "CIRCLE",
    x: number, 
    y: number, 
    radiusX: number,
    radiusY: number,
    color?: string,
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "LINE",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color?: string,
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "ARROW",
    x: number, 
    y: number, 
    points: {
        endX: number,
        endY: number
    },
    color?: string,
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "PENCIL",
    points: Array<{x: number, y: number}>,
    color?: string,
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "TEXT",
    x: number,
    y: number,
    points: Array<{letter: string}>,
    color?: string,
}

// Push shape to the queue
export async function pushShape(shape: Shapes) { 
    // Push to queue (Redis List) for ordered processing
    const queueKey = `queue:room:${shape.roomId}`;
    await client.rPush(queueKey, JSON.stringify(shape));
    
    console.log(`Pushed shape ${shape.id} to queue for room ${shape.roomId}`);
    
    // Ensure the processor is running
    if (!queueProcessorActive) {
        startQueueProcessor();
    }
    
    return shape.id;
}

// Process queues in FIFO order
async function startQueueProcessor() {
    // Only start if not already running
    if (queueProcessorActive) return;
    
    queueProcessorActive = true;
    console.log("Queue processor started");
    
    // Process immediately
    await processQueues();
    
    // Set up interval for continued processing (check every 2 seconds)
    processorInterval = setInterval(async () => {
        await processQueues();
    }, 2000);
}

// Process all pending queue items
async function processQueues() {
    try {
        // Get all room queues
        const queueKeys = await client.keys('queue:room:*');
        
        if (queueKeys.length === 0) {
            // No queues exist, stop the processor
            stopQueueProcessor();
            return;
        }
        
        let totalItemsProcessed = 0;
        
        for (const queueKey of queueKeys) {
            // Check queue length
            const queueLength = await client.lLen(queueKey);
            
            if (queueLength === 0) continue;
            
            console.log(`Processing queue ${queueKey} with ${queueLength} items`);
            
            // Process up to 20 shapes at a time from this queue
            const batchSize = 20;
            const processCount = Math.min(batchSize, queueLength);
            
            // Process each shape one by one (FIFO order)
            for (let i = 0; i < processCount; i++) {
                const shapeData = await client.lIndex(queueKey, 0); // Look at the first item
                if (!shapeData) continue;
                
                const shape = JSON.parse(shapeData) as Shapes;
                
                try {
                    // Update the shape in the database
                    await updateShapeInDatabase(shape);
                    
                    // Only remove from queue after successful DB update
                    await client.lPop(queueKey);
                    
                    totalItemsProcessed++;
                } catch (error) {
                    console.error(`Error updating shape ${shape.id}:`, error);
                    // Skip this item for now and try again later
                    break;
                }
            }
        }
        
        // If we didn't process any items or all queues are empty, stop the processor
        if (totalItemsProcessed === 0) {
            let allQueuesEmpty = true;
            
            for (const queueKey of queueKeys) {
                const queueLength = await client.lLen(queueKey);
                if (queueLength > 0) {
                    allQueuesEmpty = false;
                    break;
                }
            }
            
            if (allQueuesEmpty) {
                stopQueueProcessor();
            }
        }
    } catch (error) {
        console.error("Error in queue processor:", error);
    }
}

// Stop the queue processor when there's no more work
function stopQueueProcessor() {
    if (processorInterval) {
        clearInterval(processorInterval);
        processorInterval = null;
    }
    queueProcessorActive = false;
    console.log("Queue processor stopped - no more items to process");
}

// Update a single shape in the database
async function updateShapeInDatabase(shape: Shapes) {
    // Check if the shape exists
    const existingShape = await prismaClient.shape.findUnique({
        where: { id: shape.id }
    });

    const shapeData: any = {
        id: shape.id,
        type: shape.type,
        color: shape.color,
    };

    // Check if the shape has 'x' and 'y' properties
    if ('x' in shape && 'y' in shape) {
        shapeData.x = Number(shape.x);
        shapeData.y = Number(shape.y);
    }

    switch (shape.type) {
        case "RECTANGLE":
            shapeData.width = Number(shape.width);
            shapeData.height = Number(shape.height);
            break;
        case "CIRCLE":
            shapeData.radiusX = Number(shape.radiusX);
            shapeData.radiusY = Number(shape.radiusY);
            break;
        case "LINE":
        case "ARROW":
            shapeData.points = shape.points;
            break;
        case "PENCIL":
            shapeData.points = shape.points;
            break;
        case "TEXT":
            shapeData.textContent = shape.points;
            break;
        default:
            throw new Error(`Unknown shape type`);
    }

    shapeData.room = {
        connect: { id: shape.roomId } // Connect to the room using its ID
    };

    shapeData.user = {
        connect: { id: shape.userId } // Connect to the user using their ID
    };

    if (existingShape) {
        // Update existing shape
        await prismaClient.shape.update({
            where: { id: shape.id },
            data: shapeData
        });
    } else {
        // Create new shape
        await prismaClient.shape.create({
            data: shapeData
        });
    }
    
    console.log(`Shape ${shape.id} saved to database`);
}

// Helper functions for the WebSocket server
export async function updateData(roomId: string, message: any, userId: string) {
    if (!message.id) {
        console.error("Shape ID is required for updates");
        return null;
    }
    
    const shape = {
        id: message.id,
        roomId,
        userId,
        ...message,
    };
    
    return await pushShape(shape as Shapes);
}