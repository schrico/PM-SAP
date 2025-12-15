"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  UserPlus,
  Settings,
  UserCircle,
  Moon,
  Sun,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export function Sidebar({
  darkMode,
  setDarkMode,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const roleLabel =
    user?.role === "admin" ? "Administrator"
    : user?.role === "pm" ? "Project Manager"
    : user?.role ? "Translator"
    : "Account";

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/my-projects", icon: ClipboardList, label: "My Projects" },
    { path: "/assign-projects", icon: UserPlus, label: "Assign Projects" },
    { path: "/management", icon: FolderKanban, label: "Manage Projects" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const transitionMs = 500;
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out ${
        collapsed ? "w-20" : "w-52"
      } z-50`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <span className="text-gray-900 dark:text-white font-medium typewriter">
                TETRAEPIK
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            type="button"
          >
            {collapsed ?
              <ChevronRight className="w-5 h-5" />
            : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ?
                    "bg-blue-500 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="typewriter">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Profile & Light/Dark Mode */}
        <div className="px-3 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 transition-all duration-500 ease-in-out">
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              pathname === "/profile" ?
                "bg-blue-500 text-white shadow-sm"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title={collapsed ? "Profile" : undefined}
          >
            <UserCircle className="w-8 h-8 shrink-0 rounded-full bg-gray-300 text-gray-500 p-1" />
            {!collapsed && (
              <div className="flex-1 min-w-0 max-w-[180px] leading-tight space-y-0.5">
                <p
                  className="text-sm font-medium truncate"
                  
                >
                  {user?.name || "Profile"}
                </p>
                <p className="text-xs opacity-70 truncate" >
                  {roleLabel}
                </p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="flex cursor-pointer items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={
              collapsed ?
                darkMode ?
                  "Light Mode"
                : "Dark Mode"
              : undefined
            }
          >
            {darkMode ?
              <Sun className="w-5 h-5 shrink-0" />
            : <Moon className="w-5 h-5 shrink-0" />}
            {!collapsed && (
              <span className="typewriter">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>
        </div>
      </div>
      <style jsx>{`
        .typewriter {
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
          animation: typing ${transitionMs}ms steps(24, end);
          animation-fill-mode: both;
        }
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </aside>
  );
}
