
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
}

export type authActions = {
    signup: (data: {name: string, email: string, password: string}) => void
    login: (data: {email: string, password: string}) => void
    checkAuth: () => void
    logout: () => void
}