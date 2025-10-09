import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import { generateToken } from "../lib/utils";
import bcrypt from "bcrypt";
import { z } from "zod";

const userSignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password should be at least 8 characters")
    .max(100, "Password should not exceed 100 characters")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
    confirmPassword: z.string(),
}).strict({
  message: "Extra fields are not allowed"
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signupHandler = async (req: Request, res: Response) => {
  const response = userSignupSchema.safeParse(req.body);

  if (!response.success) {
    res.status(411).json({
      message: "Incorrect format",
      error: response.error.errors
    });
    return;
  }

  const { name, email, password } = response.data;

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(500).json({
        msg: "Email is already registered, Please Login"
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        authType: "CREDENTIALS"
      }
    });

    generateToken(newUser.id, res);

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (e) {
    console.error("error while signing up", e);
    res.status(400).json({
      msg: "error occurred while signing up",
      error: e
    });
    return;
  }
};