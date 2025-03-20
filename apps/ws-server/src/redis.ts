import { createClient } from "redis";
import { prismaClient } from "@repo/db/client";

const client = createClient();
let queueProcessorActive = false;
let processorInterval: NodeJS.Timeout | null = null;
const main = async () => {
    await client.connect();
}
main()

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
    timestamp: number
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
    timestamp: number
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
    timestamp: number
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
    timestamp: number
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "PENCIL",
    points: Array<{x: number, y: number}>,
    color?: string,
    timestamp: number
} | {
    id: string,
    roomId: string,
    userId: string,
    type: "TEXT",
    x: number,
    y: number,
    points: Array<{letter: string}>,
    color?: string,
    timestamp: number
}

// Store the latest state of shapes in a Redis hash for quick lookup
async function updateShapeCache(shape: Shapes) {
    const hashKey = `room:${shape.roomId}:shapes`;
    await client.hSet(hashKey, shape.id, JSON.stringify(shape));
}

// Push shape update to the queue and trigger processing
export async function pushShape(shape: Shapes) {
    // Add timestamp to track when the update occurred
    const shapeWithTimestamp = {
        ...shape,
        timestamp: Date.now()
    };
    
    // Update the cache with the latest state
    await updateShapeCache(shapeWithTimestamp);
    
    // Push to a FIFO queue (Redis List) for ordered processing
    const queueKey = `queue:room:${shape.roomId}`;
    await client.rPush(queueKey, JSON.stringify(shapeWithTimestamp));
    
    // Notify that we have new data to process
    await client.publish("queue:updates", shape.roomId);
    
    // Also publish for real-time updates to clients
    await client.publish(`room:${shape.roomId}:updates`, JSON.stringify(shapeWithTimestamp));
    
    console.log(`Pushed shape ${shape.id} to queue for room ${shape.roomId}`);
    
    return shapeWithTimestamp;
}

// Get the latest state of a shape from cache
export async function getLatestShape(roomId: string, shapeId: string): Promise<Shapes | null> {
    const hashKey = `room:${roomId}:shapes`;
    const shapeData = await client.hGet(hashKey, shapeId);
    
    if (!shapeData) return null;
    
    return JSON.parse(shapeData) as Shapes;
}

// Get all shapes for a room from cache
export async function getAllShapesForRoom(roomId: string): Promise<Shapes[]> {
    const hashKey = `room:${roomId}:shapes`;
    const allShapes = await client.hGetAll(hashKey);
    
    return Object.values(allShapes).map(shape => JSON.parse(shape) as Shapes);
}

// Subscribe to queue update events
async function subscribeToQueueEvents() {
    const subscriber = client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe("queue:updates", async (roomId) => {
        // Start the processor if it's not already running
        if (!queueProcessorActive) {
            startQueueProcessor();
        }
    });
    
    console.log("Subscribed to queue events");
}

// Process queues in FIFO order
async function startQueueProcessor() {
    // Only start if not already running
    if (queueProcessorActive) return;
    
    queueProcessorActive = true;
    console.log("Queue processor started");
    
    // Start with immediate processing
    await processQueues();
    
    // Set up interval for continued processing
    // We'll check every 2 seconds if there's still work to do
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
            // If no queues exist, stop the processor to save resources
            stopQueueProcessor();
            return;
        }
        
        let totalItemsProcessed = 0;
        
        for (const queueKey of queueKeys) {
            // Check queue length first
            const queueLength = await client.lLen(queueKey);
            
            if (queueLength === 0) continue;
            
            console.log(`Processing queue ${queueKey} with ${queueLength} items`);
            
            // Process up to 20 shapes at a time from this queue
            const batchSize = 20;
            const processCount = Math.min(batchSize, queueLength);
            
            // Keep track of the latest state for each shape in this batch
            const batchShapes = new Map<string, Shapes>();
            
            // Read items from the queue in batches for efficiency
            for (let i = 0; i < processCount; i++) {
                // Get the oldest item in the queue (FIFO)
                const shapeData = await client.lPop(queueKey);
                if (!shapeData) continue;
                
                const shape = JSON.parse(shapeData) as Shapes;
                
                // If we already have a newer version of this shape in the batch, compare timestamps
                if (batchShapes.has(shape.id)) {
                    const existingShape = batchShapes.get(shape.id)!;
                    // Keep the newer version based on timestamp
                    if (shape.timestamp > existingShape.timestamp) {
                        batchShapes.set(shape.id, shape);
                    }
                } else {
                    // First occurrence of this shape in the batch
                    batchShapes.set(shape.id, shape);
                }
            }
            
            // Update database with the latest state of each shape in the batch
            for (const [_, shape] of batchShapes) {
                await updateShapeInDatabase(shape);
                totalItemsProcessed++;
            }
        }
        
        // If we processed some items but there might be more, check again soon
        if (totalItemsProcessed > 0) {
            // Check if there are still items in any queue
            let hasMoreItems = false;
            for (const queueKey of queueKeys) {
                const queueLength = await client.lLen(queueKey);
                if (queueLength > 0) {
                    hasMoreItems = true;
                    break;
                }
            }
            
            // If no more items, stop the processor
            if (!hasMoreItems) {
                stopQueueProcessor();
            }
        } else {
            // If we didn't process any items, stop the processor
            stopQueueProcessor();
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
    try {
        // Check if the shape exists
        const existingShape = await prismaClient.shape.findUnique({
            where: { id: shape.id }
        });

        const shapeData: any = {
            id: shape.id,
            roomId: shape.roomId,
            userId: shape.userId,
            type: shape.type,
            color: shape.color,
            timestamp: shape.timestamp,
        };

        // Check if the shape has 'x' and 'y' properties
        if ('x' in shape && 'y' in shape) {
            shapeData.x = shape.x;
            shapeData.y = shape.y;
        }

        switch (shape.type) {
            case "RECTANGLE":
                shapeData.width = shape.width;
                shapeData.height = shape.height;
                break;
            case "CIRCLE":
                shapeData.radiusX = shape.radiusX;
                shapeData.radiusY = shape.radiusY;
                break;
            case "LINE":
            case "ARROW":
                shapeData.points = shape.points;
                break;
            case "PENCIL":
                shapeData.pencilPoints = shape.points;
                break;
            case "TEXT":
                shapeData.textContent = shape.points;
                break;
            default:
                throw new Error(`Unknown shape type`);
        }

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
    } catch (error) {
        console.error(`Error updating shape ${shape.id} in database:`, error);
        // If there's an error, add it back to the queue
        const queueKey = `queue:room:${shape.roomId}`;
        await client.rPush(queueKey, JSON.stringify(shape));
        
        // Ensure processor is active since we added an item back
        if (!queueProcessorActive) {
            startQueueProcessor();
        }
    }
}

// Modified versions of your existing functions
export async function updateData(roomId: string, message: any, userId: string) {
    if (!message.id) {
        console.error("Shape ID is required for updates");
        return;
    }
    
    const shape = {
        id: message.id,
        roomId,
        userId,
        ...message,
        timestamp: Date.now()
    };
    
    return await pushShape(shape as Shapes);
}

export async function insertIntoDB(roomId: string, message: any, userId: string) {
    // Generate a unique ID if not provided
    const shapeId = message.id;
    
    const shape = {
        id: shapeId,
        roomId,
        userId,
        ...message,
        timestamp: Date.now()
    };
    
    return await pushShape(shape as Shapes);
}
