import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../lib/utils";
import { prismaClient } from "@repo/db/client";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required"),    
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const setupGoogleAccountHandler = async (req: Request, res: Response) => {
  try {
    const setupToken = req.cookies.setup_token;
    
    if (!setupToken) {
      res.status(401).json({ message: "Invalid setup token" });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(setupToken, process.env.JWT_SECRET!) as {
      email: string;
      authType: string;
    };

    const { email, authType } = decoded;

    const response = setupSchema.safeParse(req.body);
    if (!response.success) {
      res.status(400).json({
        message: "Invalid input",
        errors: response.error.errors,
      });
      return;
    }

    const { name, password } = response.data;  

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.user.create({
      data: {
        email,
        name,           
        password: hashedPassword,
        authType: "GOOGLE",
        isEmailVerified: true
      }
    });

    // Clear the setup token cookie
    res.clearCookie('setup_token');

    // Generate auth token and send success response
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