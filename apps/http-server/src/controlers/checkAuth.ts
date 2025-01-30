import { Request, Response } from "express";

export const checkAuth = async (req: Request, res: Response) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}