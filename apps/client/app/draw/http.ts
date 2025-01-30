import { AxiosInstance } from "@/lib/axios"


export const getExistingShapes = async (roomId: string) => {
    const res = await AxiosInstance.get(`/user/shapes/${roomId}`)
    const messages = res.data

    const shapes = messages.map((x: {message: string}) => {
        const parsedMessage = JSON.parse(x.message)

        return parsedMessage
    })  

    return shapes   
}