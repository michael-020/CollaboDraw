import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import { z } from "zod";

export const verifyOtpHandler = async (req: Request, res: Response) => {
    const mySchema = z.object({
      email: z.string().email(),
      otp: z.string().length(6, "OTP must be 6 digits")
    }).strict();
  
    const response = mySchema.safeParse(req.body);
  
    if (!response.success) {
        res.status(403).json({
            msg: "Incorrect Format",
            error: response.error.errors
        });
        return
    }
  
    const { email, otp } = response.data;
  
    try {
      const otpRecord = await prismaClient.oTP.findUnique({ 
        where: {
          email
        }
      });
      if (!otpRecord || otpRecord.otp !== otp) {
        res.status(403).json({ msg: "Invalid OTP or Email" });
        return
      }
  
      const otpAge = (new Date().getTime() - otpRecord.createdAt.getTime()) / 60000; 
      if (otpAge > 10) {
        await prismaClient.oTP.delete({ 
          where: {
            email 
          }
        });
        res.status(403).json({ msg: "OTP has expired. Please request a new one." });
        return
      }
  
      await prismaClient.oTP.delete({ 
        where: {
          email 
        }
      });
  
      res.json({ msg: "OTP verified Successfully" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: "An error occurred. Please try again." });
    }
  }