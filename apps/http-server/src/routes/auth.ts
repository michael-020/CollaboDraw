import { Router } from "express";
import { handleGoogleCallback, initiateGoogleSignin, initiateGoogleSignup } from "../controlers/oauthHandler";


const authRouter: Router = Router();

authRouter.get("/google/signin", initiateGoogleSignin);
authRouter.get("/google/signup", initiateGoogleSignup);
authRouter.get("/google/callback", handleGoogleCallback);

export default authRouter;