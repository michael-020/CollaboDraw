import { Shapes } from "@/draw/drawShape";

export interface IUser  {
    id: string;           
    email: string;
    password?: string;
    name: string;
    photo?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type authState = {
    authUser: IUser | null
    isSigningUp: boolean
    isLoggingIn: boolean
    isLoggingOut: boolean
    isCheckingAuth: boolean
    isCreatingRoom: boolean
    isJoiningRoom: boolean
    isGettingUsers: boolean
    isLeavingRoom: boolean
    usersInRoom: IUser[]
    roomId: string
    isModalVisible: boolean,
    shapesArray: Shapes[]
}

export type authActions = {
    signup: (data: {name: string, email: string, password: string}) => void
    login: (data: {email: string, password: string}) => void
    checkAuth: () => void
    logout: () => void
    createRoom: (data: {name: string}) => void
    joinRoom: (roomId: string) => void
    getUsers: (roomId: string) => void
    leaveRoom: (roomId: string) => void
    changeModalVisibility: () => void,
    setShapesArray: (shape: Shapes) => void
}