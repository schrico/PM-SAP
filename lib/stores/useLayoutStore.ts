import { create } from "zustand";

interface LayoutState {
  darkMode: boolean;
  collapsed: boolean;
  setDarkMode: (value: boolean) => void;
  setCollapsed: (value: boolean) => void;
  toggleDarkMode: () => void;
  toggleCollapsed: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  darkMode: false,
  collapsed: false,
  setDarkMode: (value) => set({ darkMode: value }),
  setCollapsed: (value) => set({ collapsed: value }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));

