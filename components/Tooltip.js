"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

export default function Tooltip({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-600 hover:text-gray-400 transition-colors focus:outline-none"
        aria-label="Info"
      >
        <HelpCircle size={13} />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0F1319] border border-white/10 rounded-xl p-3 text-[11px] text-gray-300 leading-relaxed z-50 shadow-2xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F1319]" />
        </div>
      )}
    </span>
  );
}
