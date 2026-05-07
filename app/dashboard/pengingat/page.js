"use client";

import { useState } from "react";
import { Bell, Mail, MessageCircle, Calendar, AlertCircle } from "lucide-react";

export default function PengingatPage() {
  const [enabled, setEnabled] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(true);
  const [reminderDays, setReminderDays] = useState("3 hari sebelum jatuh tempo");

  const upcomingDebts = [
    { name: "Kartu Kredit BCA", date: "10 Juli 2024", status: "3 hari lagi", urgent: true },
    { name: "Kredit Motor Honda", date: "15 Agustus 2024", status: "39 hari lagi", urgent: false },
    { name: "Pinjaman Online A", date: "5 Juli 2024", status: "Sudah jatuh tempo", urgent: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pengingat Settings */}
        <div className="luxury-card rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gold/10 text-gold">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Pengingat Pembayaran</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Kirim pengingat sebelum jatuh tempo</p>
              </div>
            </div>
            <Toggle enabled={enabled} onChange={setEnabled} />
          </div>

          {/* Ingatkan Saya */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ingatkan Saya</label>
            <select
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-gold transition-colors"
            >
              <option>1 hari sebelum jatuh tempo</option>
              <option>3 hari sebelum jatuh tempo</option>
              <option>7 hari sebelum jatuh tempo</option>
              <option>14 hari sebelum jatuh tempo</option>
            </select>
          </div>

          {/* Metode */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metode</label>

            <CheckboxRow
              icon={<Mail size={18} />}
              label="Email"
              sub="andi@example.com"
              checked={emailNotif}
              onChange={setEmailNotif}
            />

            <CheckboxRow
              icon={<MessageCircle size={18} />}
              label="WhatsApp"
              sub="+62 812 3456 7890"
              checked={waNotif}
              onChange={setWaNotif}
            />
          </div>

          <button className="w-full bg-[#D4AF37] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
            Simpan Perubahan
          </button>
        </div>

        {/* Hutang Terdekat */}
        <div className="luxury-card rounded-[2rem] p-8">
          <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-6">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Hutang Terdekat Jatuh Tempo</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Pantau jadwal pembayaranmu</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingDebts.map((debt, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <AlertCircle size={18} className={debt.urgent ? "text-red-400" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{debt.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{debt.date}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest border ${
                  debt.urgent
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}>
                  {debt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? "bg-[#22C55E]" : "bg-white/10"
      }`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );
}

function CheckboxRow({ icon, label, sub, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex items-center gap-4 p-4 bg-black/20 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-colors"
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
        checked ? "bg-[#22C55E] border-[#22C55E]" : "border-white/20"
      }`}>
        {checked && <span className="text-white text-[10px] font-black">✓</span>}
      </div>
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
