import dotenv from "dotenv"
dotenv.config()
import express, { Request, Response } from "express"
import cors from "cors"
import  userRouter  from "./routes/user"
import "./lib/override"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: ["http://collabodraw.mikexdev.in", "https://collabodraw.mikexdev.in", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/user", userRouter)
app.use("/auth", authRouter)

app.get("/server-health", async (req: Request, res: Response) => {
    try {
        
        res.status(200).json({
            app: "Collabodraw-http",
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            message: 'Server is running normally'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
})

app.listen(4000)