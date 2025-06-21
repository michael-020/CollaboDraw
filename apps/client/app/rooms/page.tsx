"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import RoomCard from "@/components/RoomCard";
import { AxiosInstance } from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";

interface Room {
  id: string;
  name: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await AxiosInstance.get("/user/room");
        setRooms(res.data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleDelete = async (roomId: string) => {
    try {
      await AxiosInstance.delete(`/user/delete-room/${roomId}`);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      toast.success("Room deleted successfully!");
    } catch (error) {
      console.error("Failed to delete room", error);
      toast.error("Failed to delete room.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col gap-2 justify-center items-center">
          <Loader2 className="size-16 animate-spin text-gray-50" />
          <p className="text-white text-xl">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-4xl font-bold text-white">Your Rooms</h1>
          </div>
          
          {/* Optional: Add new room button */}
          <Link href={"/create-room"}>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                <Plus size={20} />
                <span>New Room</span>
            </button>
          </Link>
        </div>

        {/* Rooms grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-800 rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No rooms found</h3>
              <p className="text-gray-400 mb-6">Create your first room to get started</p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                Create Room
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.name}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}