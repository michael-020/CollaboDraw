import RoomCanvas from "@/components/RoomCanvas"


export default async function RoomComponent({ params }: { params: Promise<{ roomId: string }> }) {
    const roomId = (await params).roomId
  return (
    <div className="text-white">
      <RoomCanvas roomId={roomId} />
    </div>
  );
}