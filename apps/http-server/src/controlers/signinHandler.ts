import { Request, Response } from "express";
import { SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { generateToken } from "../lib/utils";

export const signinHandler = async (req: Request, res: Response) => {
     try {
            const parsedData = SigninSchema.safeParse(req.body);
    
            if (!parsedData.success) {
                res.status(400).json({
                    msg: "invalid inputs"
                });
                return;
            }
    
            const checkUser = await prismaClient.user.findFirst({
                where: {
                    email: parsedData.data.email
                }
            });
    
            if (!checkUser) {
                res.status(411).json({
                    msg: "Invalid credentials"
                });
                return;
            }
    
            // const token = jwt.sign({
            //     userId: checkUser.id
            // }, JWT_SECRET);
            generateToken(checkUser.id, res)
            res.status(200).json({
                id: checkUser.id,
                email: checkUser.email,
                name: checkUser.name
            });
        } catch (error) {
            console.log("Error while signing in", error);
            res.status(500).json({
                msg: "internal server error",
            });
        }
}