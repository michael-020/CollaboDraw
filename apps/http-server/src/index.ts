import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import  userRouter  from "./routes/user"
import "./lib/override"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true
}))

app.use("/user", userRouter)

app.listen(4000)