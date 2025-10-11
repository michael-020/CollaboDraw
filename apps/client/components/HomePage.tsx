"use client"
import { redirect, useRouter } from "next/navigation"
import { useAuthStore } from "../stores/authStore/authStore"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Loader2, User, LogOut, DoorOpen } from "lucide-react";

export default function HomePage() {
  const { logout, authUser, checkAuth, isLoggingOut, isCheckingAuth } = useAuthStore();
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [authChecked, setAuthChecked] = useState(false);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if(!authUser || isCheckingAuth){
    return <div className="bg-black h-screen w-screen">
      <Loader2 className="animate-spin size-10" />
    </div>
  }
  
  return (
    <div className="h-screen flex flex-col items-center justify-center text-white p-6 relative">

      <div className="absolute top-6 right-6" ref={dropdownRef}>
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold text-xl flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 uppercase ring-2 ring-emerald-400/20 hover:ring-emerald-400/40 transform hover:scale-105"
          >
            {authUser.email[0].toUpperCase()}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-emerald-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                </div>
                <p className="text-sm text-white truncate font-medium">{authUser?.email}</p>
              </div>

              <div className="">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/rooms");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-transparent transition-all duration-200 text-white flex items-center gap-3 group"
                >
                  <DoorOpen className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors duration-200" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Rooms</span>
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent transition-all duration-200 text-white border-t border-gray-700/50 flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 text-gray-400" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold mb-6 text-center">
        Welcome to CollaboDraw!
      </h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Create a room or join an existing one to start collaborating.
      </p>

      {/* Buttons */}
      <div className="flex space-x-6">
        <Link href={"/create-room"}>
          <button className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300">
            Create Room
          </button>
        </Link>
        <Link href={"/join-room"}>
          <button className="bg-white text-emerald-400 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition duration-300">
            Join Room
          </button>
        </Link>
      </div>
    </div>
  );
}