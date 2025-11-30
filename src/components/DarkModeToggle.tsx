"use client";

export default function DarkModeToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark");
        }
      }}
      className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold focus:outline-none hover:bg-gray-300 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      Toggle Dark/Light
    </button>
  );
}
