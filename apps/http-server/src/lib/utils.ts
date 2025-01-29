import { Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config";

export const generateToken = (userId: string, res: Response) => {
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
    });
  
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true, 
      sameSite: "lax", 
      secure: process.env.NODE_ENV !== "development",
    });
  
    return token;
};