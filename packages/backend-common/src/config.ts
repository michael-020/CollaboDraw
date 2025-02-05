import dotenv from "dotenv"
dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET as string || "pass"
console.log("JWT Secret:", JWT_SECRET);
