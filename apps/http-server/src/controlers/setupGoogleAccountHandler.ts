import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../lib/utils";
import { prismaClient } from "@repo/db/client";

const setupSchema = z.object({
  email: z.string().email()
})

export const setupGoogleAccountHandler = async (req: Request, res: Response) => {
  try {

    const response = setupSchema.safeParse(req.body);
    if (!response.success) {
      res.status(400).json({
        message: "Invalid input",
        errors: response.error.errors,
      });
      return;
    }

    const { email } = response.data;  

    const newUser = await prismaClient.user.create({
      data: {
        email,
        authType: "GOOGLE",
        isEmailVerified: true
      }
    });

    generateToken(newUser.id, res);
    res.status(200).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid or expired setup token" });
      return;
    }
    console.error("Error in setup:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkSetupToken = async (req: Request, res: Response) => {
  try {
    const setupToken = req.cookies.setup_token;
    
    if (!setupToken) {
      res.status(401).json({ message: "No valid setup token found" });
      return;
    }

    const decoded = jwt.verify(setupToken, process.env.JWT_SECRET!) as {
      email: string;
      authType: string;
    };

    res.status(200).json({ 
      email: decoded.email,
      authType: decoded.authType 
    });
  } catch (error) {
    console.error("Error checking setup token:", error);
    res.status(500).json({ message: "Invalid or expired setup token" });
  }
};