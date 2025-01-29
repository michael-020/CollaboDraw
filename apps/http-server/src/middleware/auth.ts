import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"


interface customDecoded {
   userId: string
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
   const token = req.headers["authorization"] ?? ""

   const decoded = jwt.verify(token, JWT_SECRET)

   if(decoded){
      req.userId = (decoded as customDecoded).userId
      next()
   }
   else {
      res.status(400).json({
         msg: "Invalid token"
      })
   }
}