import { createClient } from "redis";
import { updateShapeInDatabase } from "../lib/utils";

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
    id: string,
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
    textContent: string,
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
    
    queueProcessorActive = true; // queue processor started
    
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
        // Get all room queues - queues are stored as queue:room:roomId
        const queueKeys = await client.keys('queue:room:*'); // this will get all the queues with names starting with queue:room:
        
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
            
            // Process up to 20 shapes at a time from this queue
            const batchSize = 20;
            const processCount = Math.min(batchSize, queueLength);
            
            // Process each shape one by one (FIFO order)
            for (let i = 0; i < processCount; i++) {
                const shapeData = await client.lIndex(queueKey, 0); // Look at the first item
                if (!shapeData) continue;
                
                const shape = JSON.parse(shapeData);
                
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

function stopQueueProcessor() {
    if (processorInterval) {
        clearInterval(processorInterval);
        processorInterval = null;
    }
    queueProcessorActive = false;
}

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