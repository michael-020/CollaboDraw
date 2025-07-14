import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
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
    if (!req.session.googleSignup) {
      res.status(401).json({ message: "Invalid session" });
      return;
    }

    const { email, authType } = req.session.googleSignup;  // Only use email from session

    const response = setupSchema.safeParse(req.body);
    if (!response.success) {
      res.status(400).json({
        message: "Invalid input",
        errors: response.error.errors,
      });
      return;
    }

    const { name, password } = response.data;  

    // Now create the user with all required fields
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

    // Clean up session
    delete req.session.googleSignup;
    await req.session.save();

    // Generate token and send success response
    generateToken(newUser.id, res);
    res.status(200).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error in setup:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkSetupSession = async (req: Request, res: Response) => {
  try {
    if (!req.session?.googleSignup) {
      res.status(401).json({ message: "No valid setup session found" });
      return
    }

    res.status(200).json({ 
      email: req.session.googleSignup.email,
      authType: req.session.googleSignup.authType 
    });
  } catch (error) {
    console.error("Error checking setup session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};