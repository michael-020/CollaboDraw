import { createClient } from "redis";
import { prismaClient } from "@repo/db/client";
import { updateShapeInDatabase } from "../lib/utils";
import { Shapes } from "../lib/types";

const client = createClient();
let queueProcessorActive = false;
let processorInterval: NodeJS.Timeout | null = null;

const main = async () => {
    await client.connect();
    startQueueProcessor();
}
main();

export async function pushShape(shape: Shapes) { 
    const queueKey = `queue:room:${shape.roomId}`;
    await client.rPush(queueKey, JSON.stringify(shape));
    
    if (!queueProcessorActive) {
        startQueueProcessor();
    }
    
    return shape.id;
}

async function startQueueProcessor() {
    if (queueProcessorActive) return;
    
    queueProcessorActive = true; 
    
    await processQueues();
    
    processorInterval = setInterval(async () => {
        await processQueues();
    }, 2000);
}

async function processQueues() {
    try {
        const queueKeys = await client.keys('queue:room:*');
        
        if (queueKeys.length === 0) {
            stopQueueProcessor();
            return;
        }
        
        let totalItemsProcessed = 0;
        
        for (const queueKey of queueKeys) {
            const queueLength = await client.lLen(queueKey);
            
            if (queueLength === 0) continue;
            
            const batchSize = 20;
            const processCount = Math.min(batchSize, queueLength);
            
            for (let i = 0; i < processCount; i++) {
                const shapeData = await client.lIndex(queueKey, 0); 
                if (!shapeData) continue;
                
                const shape = JSON.parse(shapeData);
                
                try {
                    await updateShapeInDatabase(shape);
                    
                    await client.lPop(queueKey);
                    
                    totalItemsProcessed++;
                } catch (error) {
                    console.error(`Error updating shape ${shape.id}:`, error);
                    break;
                }
            }
        }
        
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