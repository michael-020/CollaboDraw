import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { signupHandler } from "../controlers/signupHanlder";
import { signinHandler } from "../controlers/signinHandler";
import { createRoomHandler } from "../controlers/createRoomHandler";
import { getShapesHandler } from "../controlers/getShapesHandler";
import { getRoomHandler } from "../controlers/getRoomHandler";
import { checkAuth } from "../controlers/checkAuth";
import { logoutHandler } from "../controlers/logoutHandler";
import { joinRoomHandler } from "../controlers/joinRoomHandler";
import { getUsers } from "../controlers/getUsers";
import { deleteRoomHandler } from "../controlers/deleteRoomHandler";
import { tokenHandler } from "../controlers/tokenHandler";
import { leaveRoomHandler } from "../controlers/leaveRoomHandler";
import { getUsersRoomHandler } from "../controlers/getUsersRoomsHandler";
import { generateDrawingHandler } from "../controlers/generateDrawingHandler";
import { checkSetupSession, setupGoogleAccountHandler } from "../controlers/setupGoogleAccountHandler";
import { initiateSignUpHandler } from "../controlers/initiateSignupHandler";
import { verifyOtpHandler } from "../controlers/verifyOTPHandler";

const userRouter: Router = Router();

// signup
// step 1: initiate signup
userRouter.post("/initiate-signup", initiateSignUpHandler)

// step 2: verify otp
userRouter.post("/verify-otp", verifyOtpHandler)

// step 3: complete signup
userRouter.post("/complete-signup", signupHandler)

userRouter.post("/signin", signinHandler);

userRouter.get("/check-setup-session", checkSetupSession);
userRouter.post("/setup-google-account", setupGoogleAccountHandler);


userRouter.use(authMiddleware)

userRouter.post("/create-room", createRoomHandler);

userRouter.post("/join-room/:roomId", joinRoomHandler)

userRouter.put("/leave-room/:roomId", leaveRoomHandler);

// todo: delete room
userRouter.delete("/delete-room/:roomId", deleteRoomHandler);

userRouter.get("/getUsers/:roomId", getUsers)
        
userRouter.get("/shapes/:roomId", getShapesHandler);

userRouter.get("/room/:roomId", getRoomHandler);

userRouter.get("/room", getUsersRoomHandler);

userRouter.get("/check", checkAuth)

userRouter.post("/logout", logoutHandler)

userRouter.get("/get-token", tokenHandler)

userRouter.post("/generate-drawing", generateDrawingHandler)

export default userRouter;