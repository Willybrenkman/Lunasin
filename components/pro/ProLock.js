"use client";

import { Lock, Crown, ExternalLink } from "lucide-react";

export default function ProLock({ children, isLocked = false }) {
  if (!isLocked) return children;

  return (
    <div className="relative min-h-[60vh]">
      {/* Blurred Content */}
      <div className="filter blur-[6px] pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto border border-gold/20 shadow-2xl shadow-gold/10">
            <Lock className="text-gold" size={36} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">Fitur Eksklusif PRO</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Fitur ini hanya tersedia untuk member PRO. Upgrade sekarang untuk membuka semua fitur premium Lunaskan.id.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a 
              href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.id,%20saya%20ingin%20membeli%20lisensi%20PRO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gold text-black font-black py-4 px-8 rounded-2xl shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              <Crown size={18} /> Dapatkan Akses PRO
            </a>
            <a
              href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.id,%20saya%20sudah%20punya%20kode%20unik%20tapi%20belum%20bisa%20akses"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold py-3 px-8 rounded-2xl hover:bg-white/10 transition-all text-xs"
            >
              <ExternalLink size={14} /> Sudah punya kode tapi tidak bisa akses?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
