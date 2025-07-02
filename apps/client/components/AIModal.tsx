"use client";
import { Tool } from "@/hooks/useDraw";
import { Loader2, X } from "lucide-react";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { AxiosInstance } from "@/lib/axios";
import { DrawShapes } from "@/draw/drawShape";

interface AIModalProps {
  roomId: string,
  userId: string,
  open: boolean;
  onClose: () => void;
  onSubmit?: (objectPrompt: string, flowPrompt: string) => void;
  changeTool?: (tool: Tool) => void;
  drawShapeRef: RefObject<DrawShapes | null>;
}

const AIModal: React.FC<AIModalProps> = ({ open, onClose, changeTool, drawShapeRef, roomId, userId }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [objectPrompt, setObjectPrompt] = useState("");
  const [flowPrompt, setFlowPrompt] = useState("");
  const [activeSection, setActiveSection] = useState<"object" | "flow" | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (changeTool) changeTool("");
        onClose();
        setActiveSection(null);
        setResponse(null);
        setError(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, changeTool]);

  useEffect(() => {
    if (response && Array.isArray(response) && previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext("2d");
      if (ctx) {
        drawShapeRef.current?.drawGeneratedShapes(ctx, response, roomId, userId, 480, 320);
      }
    }
  }, [response]);

  const handleSubmit = async (type: "OBJECT" | "FLOWCHART", content: string) => {
    setLoading(true);
    setResponse(null);
    setError(null);
    setLastPrompt(content); // Save the prompt for display
    try {
      const res = await AxiosInstance.post("/user/generate-drawing", { type, content });
      setResponse(res.data.result || res.data);
      setObjectPrompt(""); // Clear input after submit
      setFlowPrompt("");   // Clear input after submit
    } catch (err: any) {
      setError(err?.response?.data?.msg || "Failed to generate drawing.");
    } finally {
      setLoading(false);
    }
  };

  const insertIntoCanvas = () => {
    drawShapeRef.current?.pushToExistingShapes(userId);
    setActiveSection(null);
    setResponse(null);
    setError(null);
    setObjectPrompt("");
    setFlowPrompt("");
    setLastPrompt("");
    onClose();
    if(changeTool) changeTool("")
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        ref={modalRef}
        className={`bg-neutral-900 rounded-2xl p-8 shadow-2xl w-full max-w-md text-center border border-emerald-700 relative transition-all duration-300 ${
          response ? "max-w-2xl" : "max-w-md"
        }`}
        style={response ? { minHeight: 500 } : {}}
      >
        <button
          className="absolute top-4 left-4 text-emerald-400 hover:text-white transition"
          onClick={() => {
            if (changeTool) changeTool("");
            onClose();
            setActiveSection(null);
            setResponse(null);
            setError(null);
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
                onClick={() => {
                  setActiveSection(null);
                  setResponse(null);
                  setError(null);
                }}
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
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white focus:outline-none mb-1"
                placeholder="e.g. house, snow man..."
                value={objectPrompt}
                onChange={e => setObjectPrompt(e.target.value)}
                disabled={loading}
              />
              {error && <div className="text-red-400">{error}</div>}
            </div>
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-60"
              onClick={() => handleSubmit("OBJECT", objectPrompt)}
              disabled={loading || !objectPrompt.trim()}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin"/>
                  Generating...
                </span>
              ) : (
                "Submit"
              )}
            </button>
            {response && (
              <div className="mt-4 flex flex-col items-center w-full">
                <div className="text-emerald-300 font-semibold mb-2">
                  Generated object for: <span className="text-white">{lastPrompt}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 480,
                    maxHeight: 320,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <canvas
                    ref={previewCanvasRef}
                    width={480}
                    height={320}
                    style={{
                      background: "#222",
                      borderRadius: 8,
                      width: "100%",
                      height: "auto",
                      border: "1px solid #444",
                      display: "block",
                    }}
                  />
                </div>
                <button
                  className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                  onClick={insertIntoCanvas}
                >
                  Insert into Canvas
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === "flow" && (
          <div>
            <div className="text-left">
              <button
                className="mb-4 text-purple-400 hover:text-white transition font-semibold"
                onClick={() => {
                  setActiveSection(null);
                  setResponse(null);
                  setError(null);
                }}
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
                disabled={loading}
              />
            </div>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-60"
              onClick={() => handleSubmit("FLOWCHART", flowPrompt)}
              disabled={loading || !flowPrompt.trim()}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Submit"
              )}
            </button>
            {error && <div className="mt-4 text-red-400">{error}</div>}
            {response && (
              <div className="mt-6 text-left bg-neutral-800 rounded-lg p-4 max-h-64 overflow-auto">
                <div className="text-purple-300 font-semibold mb-2">AI Response:</div>
                <pre className="text-white text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModal;