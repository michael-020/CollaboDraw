
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
    isSigninUp: boolean
    isLoggingIn: boolean
    isLoggingOut: boolean
    isCheckingAuth: boolean
}