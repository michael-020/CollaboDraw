import React, { useState, useRef, useEffect } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ShareRoomCodeModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareRoomCodeModal: React.FC<ShareRoomCodeModalProps> = ({ roomId, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 4000);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        ref={modalRef}
        className="bg-neutral-900 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center relative border border-emerald-700"
      >
        <button
          className="absolute top-4 right-4 curosr-pointer text-emerald-400 hover:text-white transition"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Share Room Code</h2>
        
        <div className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between gap-4 mb-4">
          <span className="text-emerald-400 font-mono text-md">{roomId}</span>
          <button
            onClick={copyToClipboard}
            className="text-emerald-400 hover:text-emerald-300 transition p-2 rounded-md hover:bg-emerald-400/10"
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <p className="text-neutral-400 text-sm">
          Share this code with others to let them join your room
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ShareRoomCodeModal;