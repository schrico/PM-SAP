"use client";

import { useEffect } from "react";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";

export function DarkModeHandler() {
  const darkMode = useLayoutStore((state) => state.darkMode);
  const collapsed = useLayoutStore((state) => state.collapsed);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    html.setAttribute("data-sidebar-collapsed", collapsed.toString());
  }, [darkMode, collapsed]);

  return null;
}

