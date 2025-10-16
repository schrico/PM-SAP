"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const NavigationPills = dynamic(() => import("./NavigationPills"), { ssr: false });
const DropdownMenu = dynamic(() => import("./DropdownMenu"), { ssr: false });

export default function Header() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between
                        h-20 sm:h-24 md:h-28 lg:h-32">
          {/* Left: Back Button */}
          <button
            onClick={handleBack}
            className="p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-lg"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 sm:w-10 sm:h-10 md:w-16 md:h-16 lg:w-20 lg:h-16 text-gray-700 transition-all duration-300" />
          </button>

          {/* Center: Navigation Pills */}
          <NavigationPills />

          {/* Right: Dropdown Menu */}
          <DropdownMenu />
        </div>
      </div>
    </header>
  );
}
