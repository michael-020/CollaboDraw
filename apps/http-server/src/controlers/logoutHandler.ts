import { Request, Response } from "express";

export const logoutHandler = async (req: Request, res: Response) => {
    try {
        res.clearCookie("jwt")

        res.status(200).json({
            msg: "Logged out successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}