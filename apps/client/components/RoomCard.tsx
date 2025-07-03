"use client"
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Users, MoreVertical } from "lucide-react";
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
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs for dropdown and button
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleJoin = () => {
    router.push(`/canvas/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
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
        {/* 3-dots menu for mobile */}
        <div className="absolute top-3 right-3 sm:hidden z-20">
          <button
            ref={buttonRef}
            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
            onClick={e => {
              e.stopPropagation();
              setShowDropdown((prev) => !prev);
            }}
          >
            <MoreVertical size={18} />
          </button>
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-gray-700 rounded-lg shadow-lg z-30"
            >
              <button
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-800 w-full "
                onClick={handleDeleteClick}
              >
                <span> <Trash2 size={18} /> </span>Delete Room
              </button>
            </div>
          )}
        </div>

        {/* Delete button for desktop (on hover) */}
        <button
          className="absolute top-3 right-3 bg-red-600/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 backdrop-blur-sm hidden sm:block"
          onClick={handleDeleteClick}
        >
          <Trash2 size={16} />
        </button>

        {/* Room icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-600/20 p-4 rounded-full">
            <Users className="text-emerald-400" size={32} />
          </div>
        </div>

        {/* Room name */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white truncate" title={name}>
            {name}
          </h3>
        </div>

        {/* Join button: always visible on mobile, hover on desktop */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            className={`
              w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors duration-200
              sm:opacity-0 sm:group-hover:opacity-100 sm:transform sm:translate-y-2 sm:group-hover:translate-y-0
              opacity-100
            `}
            onClick={e => {
              e.stopPropagation();
              handleJoin();
            }}
          >
            Join Room
          </button>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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