import { IUser } from "../middleware/auth"


declare global{
    namespace Express {
        interface Request {
            userId: string
            user: IUser
        }
    }
}