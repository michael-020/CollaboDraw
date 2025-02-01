"use client";  // This ensures the component is client-side only

import { useSearchParams } from "next/navigation"; // Import the useSearchParams hook
import RoomCanvas from "@/components/RoomCanvas";

const CanvasPage: React.FC = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId"); // Get the roomId from the query params

  // Handle case if roomId is missing or invalid
  if (!roomId) {
    return <div className="text-white">Room ID is missing.</div>;
  }

  return (
    <div className="text-white">
      <RoomCanvas roomId={roomId} />
    </div>
  );
};

CanvasPage.displayName = "CanvasPage";

export default CanvasPage;
