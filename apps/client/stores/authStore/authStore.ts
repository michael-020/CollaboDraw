import { create } from "zustand";
import { authActions, authState } from "./types";
import { AxiosInstance } from "../../lib/axios";


export const useAuthStore = create<authState & authActions>((set, get) => ({
    authUser: null,
    isSigningUp: false, 
    isLoggingIn: false,
    isLoggingOut: false,
    isCheckingAuth: false,
    isCreatingRoom: false,
    roomId: "",

    signup: async (data) => {
        set({isSigningUp: true})
        try {
            const res = await AxiosInstance.post("/user/signup", data)
            set({authUser: res.data})

            console.log("authUser:", get().authUser)
        } catch (error) {
            console.error("error while signing up", error)
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
        } catch (error) {
            console.error("error while signing up", error)
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
            console.error("error while signing up", error)
            set({authUser: null})
        } finally {
            set({isCheckingAuth: false})
        }
    },

    logout: async () => {
        set({isLoggingOut: true})
        try {
            const res = await AxiosInstance.post("/user/logout")
            set({authUser: null})
        } catch (error) {
            console.error("error while signing up", error)
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
        } catch (error) {
            console.error(error)
        } finally {
            set({isCreatingRoom: false})
        }
    },

    joinRoom: async (roomId) => {
        try {
            const res = await AxiosInstance.post(`/user/join-room/${roomId}`)
        } catch (error) {
            console.error(error)
        }
    },
}))