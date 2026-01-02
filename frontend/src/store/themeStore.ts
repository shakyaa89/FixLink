import { create } from "zustand";

type ThemeState = {
  theme: string;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",

  setTheme: (theme: string) => set({ theme }),
  toggleTheme: () => {
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" }));
    console.log("Theme toggled");
  },
}));
