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

const userRouter: Router = Router();

userRouter.post("/signup", signupHandler);

userRouter.post("/signin", signinHandler);

userRouter.use(authMiddleware)

userRouter.post("/create-room", createRoomHandler);

userRouter.post("/join-room/:roomId", joinRoomHandler)

userRouter.get("/getUsers/:roomId", getUsers)
        
userRouter.get("/shapes/:roomId", getShapesHandler);

userRouter.get("/room/:slug", getRoomHandler);

userRouter.get("/check", checkAuth)

userRouter.post("/logout", logoutHandler)

export default userRouter;