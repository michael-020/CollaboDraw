"use client";
import React, { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import RoomCard from "@/components/RoomCard";
import RoomCardSkeleton from "@/components/RoomCardSkeleton";
import { AxiosInstance } from "@/lib/axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore/authStore";

interface Room {
  id: string;
  name: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore()
  
  useEffect(() => {
    const checkUserAuth = async () => {
      await checkAuth();  
      setAuthChecked(true);  
    };

    checkUserAuth();
  }, [checkAuth]);

  
  useEffect(() => {
    if (authChecked && !authUser) {
      redirect("/");  
    }
  }, [authChecked, authUser]);

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
    router.push("/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg w-fit"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mt-2 sm:mt-0">
              Your Rooms
            </h1>
          </div>
          {/* Optional: Add new room button */}
          <Link href={"/create-room"}>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 w-full sm:w-auto">
              <Plus size={20} />
              <span>New Room</span>
            </button>
          </Link>
        </div>

          {/* Room cards skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <RoomCardSkeleton key={index} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if(!authUser || isCheckingAuth){
    return <div className="bg-black h-screen w-screen">
      <Loader2 className="animate-spin size-10" />
    </div>
  }

  return (
    <div className="min-h-screen bg-black p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg w-fit"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mt-2 sm:mt-0">
              Your Rooms
            </h1>
          </div>
          {/* Optional: Add new room button */}
          <Link href={"/create-room"}>
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 w-full sm:w-auto">
              <Plus size={20} />
              <span>New Room</span>
            </button>
          </Link>
        </div>

        {/* Rooms grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-12 max-w-xs sm:max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                No rooms found
              </h3>
              <p className="text-gray-400 mb-6 text-sm sm:text-base">
                Create your first room to get started
              </p>
              <Link href={"/create-room"}>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors duration-200 w-full">
                  Create Room
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
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