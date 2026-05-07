"use client";

import { BarChart3, AlertCircle } from "lucide-react";

export default function PlaceholderPage({ title = "Halaman Sedang Dikembangkan" }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="bg-gold/10 p-6 rounded-full">
        <BarChart3 className="text-gold" size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
          Kami sedang mempersiapkan fitur ini untuk memberikan pengalaman terbaik dalam mengelola hutang Anda. Silakan cek kembali dalam waktu dekat!
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
        <AlertCircle size={14} /> Under Construction
      </div>
    </div>
  );
}
