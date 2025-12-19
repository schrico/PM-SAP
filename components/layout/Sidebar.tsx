"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  Receipt,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";
import { TypewriterText } from "@/components/ui/TypewriterText";

export function Sidebar() {
  const { darkMode, collapsed, toggleDarkMode, toggleCollapsed } =
    useLayoutStore();
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
    { path: "/invoicing", icon: Receipt, label: "Invoicing" },
  ];

  // Controls when text labels are visible (for smooth transition)
  const [showLabels, setShowLabels] = useState(!collapsed);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [darkModeJustChanged, setDarkModeJustChanged] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (!collapsed) {
      // expanding → wait before showing labels and starting animation
      timeout = setTimeout(() => {
        setShowLabels(true);
        setShouldAnimate(true);
      }, 115);
    } else {
      // collapsing → hide labels immediately and reset animation
      setShowLabels(false);
      setShouldAnimate(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [collapsed]);

  // Track darkMode changes to show text immediately when toggled
  useEffect(() => {
    setDarkModeJustChanged(true);
    // Reset the flag after a short delay to allow normal animation on next expand
    const resetTimeout = setTimeout(() => {
      setDarkModeJustChanged(false);
    }, 1000);
    return () => clearTimeout(resetTimeout);
  }, [darkMode]);
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? "w-20" : "w-52"
      } z-50`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {showLabels && (
              <span className="text-gray-900 dark:text-white font-medium">
                {shouldAnimate ?
                  <TypewriterText text="TETRAEPIK" speed={30} delay={0} />
                : "TETRAEPIK"}
              </span>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
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
          {navItems.map((item, index) => {
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
                {showLabels && (
                  <span>
                    {shouldAnimate ?
                      <TypewriterText
                        text={item.label}
                        speed={30}
                        delay={50 + index * 40}
                      />
                    : item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="px-3 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
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
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  {shouldAnimate ?
                    <TypewriterText
                      text={user?.name || "Profile"}
                      speed={30}
                      delay={250}
                    />
                  : user?.name || "Profile"}
                </p>
                <p className="text-xs opacity-70 truncate">
                  {shouldAnimate ?
                    <TypewriterText text={roleLabel} speed={30} delay={300} />
                  : roleLabel}
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Settings & Dark Mode Toggle */}
        <div className="px-3 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              pathname === "/settings" ?
                "bg-blue-500 text-white shadow-sm"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {showLabels && (
              <span>
                {shouldAnimate ?
                  <TypewriterText text="Settings" speed={30} delay={350} />
                : "Settings"}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleDarkMode}
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
            {showLabels && (
              <span>
                {shouldAnimate && !darkModeJustChanged ?
                  <TypewriterText
                    text={darkMode ? "Light Mode" : "Dark Mode"}
                    speed={30}
                    delay={400}
                    key={darkMode ? "light" : "dark"}
                  />
                : darkMode ?
                  "Light Mode"
                : "Dark Mode"}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
