import { AxiosInstance } from "@/lib/axios"


export const getExistingShapes = async (roomId: string) => {
    const res = await AxiosInstance.get(`/user/shapes/${roomId}`)
    const messages = await res.data
    // const shapes = messages.map((x: {message: string}) => {

    //     const messageData = x
    //     console.log(messageData)

    // })


    return messages;  
}