import { useAuthStore } from '@/stores/authStore/authStore'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import { createPortal } from "react-dom";

const LeaveRoomModal = () => {
  const { changeModalVisibility } = useAuthStore()
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        changeModalVisibility();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [changeModalVisibility]);

  const leaveRoomHandler = () => {
    router.replace("/home-page")
    changeModalVisibility()
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        ref={modalRef}
        className="bg-neutral-900 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center relative border border-emerald-700"
      >
        {/* X mark */}
        <button
          className="absolute top-4 left-4 text-emerald-400 hover:text-white transition"
          onClick={changeModalVisibility}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Exit Room</h2>
        <h3 className="text-md text-white/60 mb-6">Are you sure you want to leave?</h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={leaveRoomHandler}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Yes
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            onClick={changeModalVisibility}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}

export default LeaveRoomModal;