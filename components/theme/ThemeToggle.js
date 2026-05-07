"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Hindari hydration mismatch — render placeholder sampai mounted
  if (!mounted) {
    return (
      <button className="p-2.5 rounded-xl text-gray-400 w-[42px] h-[42px]" aria-label="Theme toggle" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5 relative overflow-hidden"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-[22px] h-[22px]">
        <Sun
          size={22}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-50"
          }`}
        />
        <Moon
          size={22}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-50"
          }`}
        />
      </div>
    </button>
  );
}
