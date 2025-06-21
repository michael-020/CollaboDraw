"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Users } from "lucide-react";
import DeleteRoomModal from "./DeleteRoomModal";

interface RoomCardProps {
  id: string;
  name: string;
  onDelete: (id: string) => Promise<void>;
}

const RoomCard: React.FC<RoomCardProps> = ({ id, name, onDelete }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleJoin = () => {
    router.push(`/canvas/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    await onDelete(id);
    setDeleting(false);
    setShowModal(false);
  };

  const handleCancelDelete = () => {
    if (!deleting) setShowModal(false);
  };

  return (
    <>
      <div
        className="group relative bg-gradient-to-br from-neutral-900 to-black rounded-2xl p-6 aspect-square cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-gray-600"
        onClick={handleJoin}
      >
        {/* Delete button in top-right corner */}
        <button
          className="absolute top-3 right-3 bg-red-600/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 backdrop-blur-sm"
          onClick={handleDeleteClick}
        >
          <Trash2 size={16} />
        </button>

        {/* Room icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600/20 p-4 rounded-full">
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        {/* Room name */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white truncate" title={name}>
            {name}
          </h3>
        </div>

        {/* Join button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            onClick={(e) => {
              e.stopPropagation();
              handleJoin();
            }}
          >
            Join Room
          </button>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      {showModal && (
        <DeleteRoomModal
          roomName={name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          deleting={deleting}
        />
      )}
    </>
  );
};

export default RoomCard;