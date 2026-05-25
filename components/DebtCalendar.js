"use client";

import { CalendarDays, AlertCircle } from "lucide-react";
import { getUpcomingDebts } from "@/lib/reminder";

export default function DebtCalendar({ debts }) {
  const upcoming = getUpcomingDebts(debts);

  return (
    <div className="luxury-card rounded-[2rem] p-8 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">Jadwal Tagihan</h3>
          <p className="text-xl font-black text-white flex items-center gap-2">
            <CalendarDays size={20} className="text-gold" /> Calendar
          </p>
        </div>
        {upcoming.length > 0 && (
          <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-red-500/20">
            <AlertCircle size={12} /> {upcoming.length} Segera Jatuh Tempo
          </div>
        )}
      </div>

      <div className="space-y-3 mt-6">
        {debts.map((d, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-gold"></div>
               <span className="font-bold text-sm text-white">{d.name}</span>
            </div>
            <span className="text-[11px] font-medium text-gray-400 bg-[#06080C] px-3 py-1.5 rounded-lg border border-white/5">{d.tanggal_tagihan ? `Tgl ${d.tanggal_tagihan}` : '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
