"use client";
import { useAuthStore } from "@/stores/authStore/authStore";
import { Loader2 } from "lucide-react";

export default function ClientAuthLoader() {
  const { isCheckingAuth } = useAuthStore();
  if (!isCheckingAuth) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <Loader2 className="size-16 animate-spin text-emerald-400" />
    </div>
  );
}