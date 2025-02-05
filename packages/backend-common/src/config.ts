import dotenv from "dotenv"
dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET || "pass"
console.log("JWT Secret:", process.env.JWT_SECRET);
