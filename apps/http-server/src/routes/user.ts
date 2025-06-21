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

const userRouter: Router = Router();

userRouter.post("/signup", signupHandler);

userRouter.post("/signin", signinHandler);

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

export default userRouter;