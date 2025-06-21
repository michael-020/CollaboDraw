"use client"
import React from "react";
import { Loader2 } from "lucide-react";

interface DeleteRoomModalProps {
  roomName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting?: boolean;
}

const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
  roomName,
  onConfirm,
  onCancel,
  deleting = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-xl p-8 shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-xl font-bold text-white mb-4">Delete Room</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-red-400">{roomName}</span>?
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center"
            onClick={onConfirm}
            disabled={deleting}
          >
            {!deleting ? <div className="px-4">
                <Loader2 className="animate-spin" size={18} />
            </div>  : "Delete"}
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomModal;