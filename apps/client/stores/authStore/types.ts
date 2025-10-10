import { Shapes } from "@/draw/drawShape";

export interface IUser  {
    id: string;           
    email: string;
    password?: string;
    name?: string;
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
    inputEmail: string
    isVerifying: boolean
    sendingEmail: boolean
    otpSent: boolean
}

export type authActions = {
    signup: (data: { email: string, password: string, confirmPassword: string}) => void
    login: (data: {email: string, password: string}) => void
    checkAuth: () => void
    logout: () => void
    createRoom: (data: {name: string}) => void
    joinRoom: (roomId: string) => Promise<boolean>
    getUsers: (roomId: string) => void
    leaveRoom: (roomId: string) => void
    changeModalVisibility: () => void,
    setShapesArray: (shape: Shapes) => void,
    handleGoogleSignin: () => void;
    handleGoogleAuthError: () => void;
    handleGoogleSignup: () => void;
    sentEmail: (data: {email: string}) => void;
    verifyEmail: (data: {email: string, otp: string}) => void;
    resetOtpSent: () => void;
}