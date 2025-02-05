import { Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";

export const generateToken = (userId: string, res: Response) => {
  console.log("jwt in signing token: ", JWT_SECRET)
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
    });
  
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true, 
      sameSite: "lax", 
      secure: false,
    });
    
    console.log("token in generation: ", token)
    return token;
};