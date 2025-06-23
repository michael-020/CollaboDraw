"use client";
import { Tool } from "@/hooks/useDraw";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface AIModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (objectPrompt: string, flowPrompt: string) => void;
  changeTool?: (tool: Tool) => void; 
}

const AIModal: React.FC<AIModalProps> = ({ open, onClose, onSubmit, changeTool }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [objectPrompt, setObjectPrompt] = useState("");
  const [flowPrompt, setFlowPrompt] = useState("");
  const [activeSection, setActiveSection] = useState<"object" | "flow" | null>(null);

  // Handle outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (changeTool) changeTool("");
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, changeTool]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        ref={modalRef}
        className="bg-neutral-900 rounded-2xl p-8 shadow-2xl w-full max-w-md text-center border border-emerald-700 relative"
      >
        <button
          className="absolute top-4 left-4 text-emerald-400 hover:text-white transition"
          onClick={() => {
            if (changeTool) changeTool("");
            onClose();
          }}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">AI Drawing Assistant</h2>

        {!activeSection && (
          <div className="flex flex-row gap-6 justify-center mb-4">
            <button
              className="flex-1 bg-emerald-800/70 hover:bg-emerald-600 text-white rounded-xl p-6 font-semibold text-lg shadow transition-all duration-200 border-2 border-transparent hover:border-emerald-400"
              onClick={() => setActiveSection("object")}
            >
              Draw an Object
            </button>
            <button
              className="flex-1 bg-purple-800/70 hover:bg-purple-600 text-white rounded-xl p-6 font-semibold text-lg shadow transition-all duration-200 border-2 border-transparent hover:border-purple-400"
              onClick={() => setActiveSection("flow")}
            >
              Draw a Flow Chart
            </button>
          </div>
        )}

        {activeSection === "object" && (
          <div>
            <div className="text-left">
                <button
                className="mb-4 text-emerald-400 hover:text-white transition font-semibold"
                onClick={() => setActiveSection(null)}
                >
                ← Back
                </button>
            </div>
            <div className="mb-6 text-left">
              <label className="block text-emerald-300 font-semibold mb-2">
                What object should I draw?
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white focus:outline-none mb-4"
                placeholder="e.g. house, snow man..."
                value={objectPrompt}
                onChange={e => setObjectPrompt(e.target.value)}
              />
            </div>
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              onClick={() => {
                if (onSubmit) onSubmit(objectPrompt, "");
                if (changeTool) changeTool("");
                onClose();
              }}
            >
              Submit
            </button>
          </div>
        )}

        {/* Flow chart input section */}
        {activeSection === "flow" && (
          <div>
            <div className="text-left">
                <button
                className="mb-4 text-purple-400 hover:text-white transition font-semibold"
                onClick={() => setActiveSection(null)}
                >
                ← Back
                </button>
            </div>
            <div className="mb-6 text-left">
              <label className="block text-purple-300 font-semibold mb-2">
                Describe your flow chart
              </label>
              <textarea
                className="w-full px-4 py-2 resize-none rounded bg-neutral-800 text-white focus:outline-none"
                placeholder="e.g. receive request - validate input - query DB - return response"
                value={flowPrompt}
                onChange={e => setFlowPrompt(e.target.value)}
              />
            </div>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              onClick={() => {
                if (onSubmit) onSubmit("", flowPrompt);
                if (changeTool) changeTool("");
                onClose();
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModal;