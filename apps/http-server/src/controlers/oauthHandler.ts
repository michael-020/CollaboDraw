import { Request, Response } from "express";
import { GOOGLE_CONFIG } from "../config/oauth";
import axios from "axios";
import { generateToken } from "../lib/utils";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

// Common function to initiate Google OAuth
const initiateGoogleAuth = (req: Request, res: Response) => {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.append('client_id', GOOGLE_CONFIG.client_id);
  authUrl.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirect_uri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', GOOGLE_CONFIG.scope);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'select_account');
  
  res.redirect(authUrl.toString());
};

export const initiateGoogleSignin = (req: Request, res: Response) => {
  initiateGoogleAuth(req, res);
};

export const initiateGoogleSignup = (req: Request, res: Response) => {
  initiateGoogleAuth(req, res);
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    const tokenResponse = await axios.post(GOOGLE_CONFIG.token_uri, {
      code,
      client_id: GOOGLE_CONFIG.client_id,
      client_secret: GOOGLE_CONFIG.client_secret,
      redirect_uri: GOOGLE_CONFIG.redirect_uri,
      grant_type: "authorization_code"
    });

    const { access_token } = tokenResponse.data;
    const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email } = userInfoResponse.data;
    const existingUser = await prismaClient.user.findUnique({ 
        where: {
            email
        }
    });

    if(existingUser?.authType == "CREDENTIALS"){
      return res.redirect(`${process.env.FRONTEND_URL}/signin?error=please_signin_with_credentials`);
    }

    if (!existingUser) {
      const newUser = await prismaClient.user.create({
        data: {
          email,
          authType: "GOOGLE",
          isEmailVerified: true
        }
      });

      generateToken(newUser.id, res);

      return res.redirect(
        `${process.env.FRONTEND_URL}/home-page`
      );
    }
    else{
      generateToken(existingUser.id, res);
      return res.redirect(`${process.env.FRONTEND_URL}/home-page`);
    }

  } catch (error) {
    console.error("OAuth error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/verify-email?error=oauth_failed`);
  }
};