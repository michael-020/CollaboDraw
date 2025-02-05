import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { prismaClient } from "@repo/db/client"


interface customDecoded {
    userId?: string,
    user?: IUser
}

export interface IUser  {
    id: string;           
    email: string;
    password?: string;
    name: string;
    photo?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt

        const decoded = jwt.verify(token, JWT_SECRET)

        if(decoded){
            const user = await prismaClient.user.findFirst({
                where: {
                    id: (decoded as customDecoded).userId
                },
                select: {
                    password: false,
                    email: true,
                    name: true,
                    id: true,
                    photo: true,
                    createdAt: true,
                    updatedAt: true
                }
            })

            if(!user){
                res.status(400).json({
                    msg: "user not found"
                })
                return
            }

            req.user = user as IUser
            next()
        }
        else {
            res.status(400).json({
                msg: "You are not logged in"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
   
}