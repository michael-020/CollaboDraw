import { CreateUserSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken"

export const signupHandler = async (req: Request, res: Response) => {
    try {
        const data = CreateUserSchema.safeParse(req.body);

        if (!data.success) {
            res.status(400).json({
                msg: "invalid inputs"
            });
            return;
        }

        const { email, name, password } = data.data;

        const newUser = await prismaClient.user.create({
            data: {
                email,
                password,
                name,
            }
        });

        const token = jwt.sign({
            userId: newUser.id
        }, JWT_SECRET);

        res.json({
            msg: "signup successful",
            newUser,
            token
        });
    } catch (error) {
        console.log("Error while signing up", error);
        res.status(500).json({
            msg: "internal server error",
            error: (error as Error).message
        });
    }
}