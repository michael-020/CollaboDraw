import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { signupHandler } from "../controlers/signupHanlder";
import { signinHandler } from "../controlers/signinHandler";
import { createRoomHandler } from "../controlers/createRoomHandler";
import { getShapesHandler } from "../controlers/getShapesHandler";
import { getRoomHandler } from "../controlers/getRoomHandler";

const userRouter: Router = Router();

userRouter.post("/signup", signupHandler);

userRouter.post("/signin", signinHandler);

userRouter.use(authMiddleware)

userRouter.post("/create-room", createRoomHandler);

userRouter.get("/shapes/:roomId", getShapesHandler);

userRouter.get("/room/:slug", getRoomHandler);

export default userRouter;