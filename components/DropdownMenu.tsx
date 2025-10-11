"use client";

import { useState } from "react";
import { Settings, LogOut, Menu, CircleUserRound } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function DropdownMenu() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-lg"
        aria-label="Menu"
        aria-expanded={isDropdownOpen}
      >
        <Menu className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-700 transition-all duration-300" />
      </button>

      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-36 sm:w-40 md:w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <a
            href="/profile"
            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all duration-300"
          >
            <CircleUserRound className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base md:text-base lg:text-lg">Profile</span>
          </a>
          <a
            href="/settings"
            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all duration-300"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base md:text-base lg:text-lg">Settings</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 hover:shadow-sm transition-all duration-300"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base md:text-base lg:text-lg">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
