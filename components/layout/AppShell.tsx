"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-150 ${
        darkMode ? "dark" : ""
      }`}
      data-sidebar-collapsed={collapsed}
    >
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main
        className={`min-h-screen transition-all duration-150 ${
          collapsed ? "ml-20" : "ml-52"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
