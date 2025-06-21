"use client"
import React from "react";
import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";

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
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center relative border border-red-400">
        {/* X mark */}
        <button
          className="absolute top-4 left-4 text-red-400 hover:text-white transition"
          onClick={onCancel}
          disabled={deleting}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Delete Room</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-400">{roomName}</span>?
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center disabled:opacity-60"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {deleting ? "Deleting..." : "Delete"}
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
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
};

export default DeleteRoomModal;