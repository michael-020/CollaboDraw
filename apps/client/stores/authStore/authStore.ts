import { create } from "zustand";
import { authActions, authState } from "./types";
import { AxiosInstance } from "../../lib/axios";
import { Shapes } from "@/draw/drawShape";
import toast from "react-hot-toast";


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

    signup: async (data) => {
        set({isSigningUp: true})
        try {
            const res = await AxiosInstance.post("/user/signup", data)
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
        } catch (error) {
            console.error(error)
        } finally {
            set({isCreatingRoom: false})
        }
    },

    joinRoom: async (roomId) => {
        set({isJoiningRoom: true})
        try {
            const res = await AxiosInstance.post(`/user/join-room/${roomId}`)
            set({roomId: res.data.id})
            console.log("join roomId: ", res.data.id)
            set((state) => ({
                usersInRoom: state.authUser ? [...state.usersInRoom, state.authUser] : state.usersInRoom
            }));
        } catch (error) {
            console.error(error)
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
            console.log("users in room before: ", get().usersInRoom)
            console.log("room: ", roomId)
            const res = await AxiosInstance.put(`/user/leave-room/${roomId}`)
            set({usersInRoom: res.data})
            console.log("users in room after: ", get().usersInRoom)
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
    }
}))