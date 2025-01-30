import RoomCanvas from "@/components/RoomCanvas"


export default async function ({params}: {
    params: {
        roomId: string
    }
}){
    const roomId = (await params).roomId
    return <div className="text-white">
        {/* this is the canvas
        {roomId} */}
        <RoomCanvas roomId={roomId} />
    </div>
}