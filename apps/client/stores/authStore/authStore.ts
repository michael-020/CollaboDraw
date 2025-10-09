import { create } from "zustand";
import { authActions, authState } from "./types";
import { AxiosInstance } from "../../lib/axios";
import { Shapes } from "@/draw/drawShape";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create<authState & authActions>((set, get) => ({
    authUser: null,
    isSigningUp: false, 
    isLoggingIn: false,
    isLoggingOut: false,
    isCheckingAuth: false,
    isCreatingRoom: false,
    isJoiningRoom: false,
    usersInRoom: [],
    isGettingUsers: false,
    isLeavingRoom: false,
    roomId: "",
    isModalVisible: false,
    shapesArray: [],
    inputEmail: "",
    otpSent: false,
    isVerifying: false,
    sendingEmail: false,

    signup: async (data) => {
        set({isSigningUp: true})
        try {
            const res = await AxiosInstance.post("/user/complete-signup", data)
            set({authUser: res.data})
            toast.success("Signed up successfully")
        } catch (error) {
            console.error("error while signing up", error)
            toast.error("failed to signup")
            set({authUser: null})
        } finally {
            set({isSigningUp: false})
        }
    },

    login: async (data) => {
        set({isLoggingIn: true})
        try {
            const res = await AxiosInstance.post("/user/signin", data)
            set({authUser: res.data})
            toast.success("Logged in successfully")
        } catch (error) {
            console.error("error while logging in", error)
            toast.error("failed to login")
            set({authUser: null})
        } finally {
            set({isLoggingIn: false})
        }
    },

    checkAuth: async () => {
        set({isCheckingAuth: true})
        try {
            const res = await AxiosInstance.get("/user/check")
            set({authUser: res.data})
        } catch (error) {
            console.error("error while checking auth", error)
            set({authUser: null})
        } finally {
            set({isCheckingAuth: false})
        }
    },

    logout: async () => {
        set({isLoggingOut: true})
        try {
            await AxiosInstance.post("/user/logout")
            set({authUser: null})
        } catch (error) {
            console.error("error while logging out", error)
        } finally {
            set({isLoggingOut: false})
        }
    },

    createRoom: async (data) => {
        set({isCreatingRoom: true})
        try {
            const res = await AxiosInstance.post("/user/create-room", data)
            const roomId = res.data.roomId
            set({roomId: roomId})
            toast.success("Room created Successfully")
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg);
            } else {
                toast.error("Failed to create room");
            }
        } finally {
            set({isCreatingRoom: false})
        }
    },

    joinRoom: async (roomId): Promise<boolean> => {
        set({isJoiningRoom: true})
        try {
            if (!roomId?.trim()) {
                toast.error("Please enter a valid Room ID");
                return false;
            }

            const res = await AxiosInstance.post(`/user/join-room/${roomId}`)
            set({roomId: res.data.id})
            set((state) => ({
                usersInRoom: state.authUser ? [...state.usersInRoom, state.authUser] : state.usersInRoom
            }));
            toast.success("Room Joined Successfully")
            return true
        } catch (error) {
            console.error(error)
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg);
            } else {
                toast.error("Failed to create room");
            }
            return false
        } finally {
            set({isJoiningRoom: false})
        }
    },

    getUsers: async (roomId) => {
        set({isGettingUsers: true})
        try {
            const res = await AxiosInstance.get(`/user/getUsers/${roomId}`)
            set({usersInRoom: res.data})
        } catch (error) {
            console.error(error)
        } finally {
            set({isGettingUsers: false})
        }
    },

    leaveRoom: async(roomId) => {
        set({isLeavingRoom: true})
        try {   
            const res = await AxiosInstance.put(`/user/leave-room/${roomId}`)
            set({usersInRoom: res.data})
        } catch (error) {
            console.error(error)
        } finally {
            set({isLeavingRoom: false})
        }
    },

    changeModalVisibility: () => {
        set((state) => ({
            isModalVisible: !state.isModalVisible
        }))
    },

    setShapesArray: (shape: Shapes) => {
        get().shapesArray.push(shape)
    },

    handleGoogleSignin: () => {
        window.location.href = `${API_URL}/auth/google/signin`;
    },

    handleGoogleSignup: () => {
        window.location.href = `${API_URL}/auth/google/signup`;
    },

    handleGoogleAuthError: () => {
        const searchParams = new URLSearchParams(window.location.search);
        const error = searchParams.get('error');
        const email = searchParams.get('email');
        
        if (email) {
            set({ inputEmail: email });
        }
        
        if (error === 'email_exists') {
            toast.error("An account with this email already exists. Please sign in.");
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }
        else if (error === 'please_signin_with_credentials') {
            toast.error("This email is already registered with a password. Please use your original sign-in method.");
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }
        else if (error === 'oauth_failed') {
            toast.error("Failed to authenticate with Google. Please try again.");
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }
        else if(error === "no_account"){
            toast.error("An account with this email doesn't exist. Please sign up.")
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }

        return false;
    },

        sentEmail: async (data) => {
        set({sendingEmail: true})
        try {
            await AxiosInstance.post("/user/initiate-signup", data)
            set({ otpSent: true })
            toast.success("OTP is sent to your account")
        } catch(error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({sendingEmail: false})
        }
    },
    
    verifyEmail: async (data) => {
        set({isVerifying: true})
        try {
            await AxiosInstance.post("/user/verify-otp", data)
            set({ 
                inputEmail: data.email,  // Set inputEmail only after successful verification
                otpSent: false  // Reset OTP sent status only on success
            })
            toast.success("Email verification is Successful")
            return true; // Indicate success
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
            throw error; // Re-throw to handle in component
        } finally {
            set({isVerifying: false})
        }
    },

    resetOtpSent: () => {
        set({ otpSent: false })
    },
}))