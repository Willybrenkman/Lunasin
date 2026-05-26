"use client";

import { CalendarDays, AlertCircle } from "lucide-react";
import { getUpcomingDebts } from "@/lib/reminder";

export default function DebtCalendar({ debts }) {
  let stored = {};
  try {
    stored = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("pengingat_settings") || "{}")
      : {};
  } catch {}
  const days = parseInt(stored.reminderDays) || 3;
  const upcoming = getUpcomingDebts(debts, days);

  // Hanya tampilkan hutang yang punya jadwal tagihan, sorted by day
  const withSchedule = [...debts]
    .filter(d => d.tanggal_tagihan)
    .sort((a, b) => Number(a.tanggal_tagihan) - Number(b.tanggal_tagihan));

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
        {withSchedule.length === 0 ? (
          <p className="text-gray-600 text-sm font-medium text-center py-4">Belum ada jadwal tagihan.</p>
        ) : withSchedule.map((d, i) => {
          const isUpcoming = upcoming.some(u => u.id === d.id);
          return (
            <div
              key={i}
              className={`flex justify-between items-center p-4 rounded-2xl border transition-colors ${
                isUpcoming
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-black/20 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isUpcoming ? "bg-red-400" : "bg-gold"}`} />
                <span className="font-bold text-sm text-white">{d.name}</span>
              </div>
              <span className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border ${
                isUpcoming
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-[#06080C] text-gray-400 border-white/5"
              }`}>
                Tgl {d.tanggal_tagihan}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
