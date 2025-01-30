

export default async function ({params}: {
    params: {
        roomId: number
    }
}){
    const roomId = (await params).roomId
    return <div className="text-white">
        this is the canvas
        {roomId}
    </div>
}