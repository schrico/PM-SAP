"use client";

import { Home, Folder } from "lucide-react";
import { usePathname } from "next/navigation";

export default function NavigationPills() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Folder, label: "My Projects", path: "/my-projects" },
  ];

  return (
    <nav className="flex w-full max-w-6xl bg-gray-100 rounded-full
                    px-3 sm:px-6 md:px-10 lg:px-16 py-2 sm:py-3 md:py-4
                    space-x-2 sm:space-x-4 md:space-x-6 shadow-inner justify-center
                    mx-1 sm:mx-2 md:mx-4 lg:mx-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <a
            key={item.path}
            href={item.path}
            className={`
              flex-1 flex justify-center items-center
              px-4 sm:px-6 md:px-8 lg:px-10
              py-2 sm:py-3 md:py-4
              mx-1 sm:mx-2 md:mx-4 lg:mx-6
              space-x-2 sm:space-x-3 md:space-x-4
              rounded-full
              transition-all duration-300 transform
              ${isActive 
                ? "bg-white text-blue-600 shadow-md font-medium scale-105 md:scale-110"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105 md:hover:scale-110 hover:shadow-lg"
              }
            `}
          >
            <Icon className="w-5 h-5 sm:w-6 md:w-8 lg:w-10 transition-transform duration-300" />
            <span className="text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300">
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
