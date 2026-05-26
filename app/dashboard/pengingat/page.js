"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, MessageCircle, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PengingatPage() {
  const [enabled, setEnabled] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [reminderDays, setReminderDays] = useState("3 hari sebelum jatuh tempo");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [debts, setDebts] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("pengingat_settings");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.enabled !== undefined) setEnabled(s.enabled);
        if (s.reminderDays) setReminderDays(s.reminderDays);
        if (s.emailNotif !== undefined) setEmailNotif(s.emailNotif);
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        setUserEmail(user.email || "");

        // Fetch debts with tanggal_tagihan
        const { data, error } = await supabase
          .from("debts")
          .select("name, tanggal_tagihan, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .not("tanggal_tagihan", "is", null);

        if (!error && data) setDebts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute upcoming debts from real data based on monthly schedule (tanggal_tagihan)
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const clampDay = (year, month, day) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDay));
  };

  const upcomingDebts = debts.filter(d => d.tanggal_tagihan).map(d => {
    let dueDate = clampDay(today.getFullYear(), today.getMonth(), d.tanggal_tagihan);

    if (dueDate < todayStart) {
      dueDate = clampDay(today.getFullYear(), today.getMonth() + 1, d.tanggal_tagihan);
    }

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let status = "";
    let urgent = false;

    if (diffDays === 0) {
      status = "Hari ini!";
      urgent = true;
    } else if (diffDays <= 7) {
      status = `${diffDays} hari lagi`;
      urgent = true;
    } else {
      status = `${diffDays} hari lagi`;
      urgent = false;
    }

    return {
      name: d.name,
      date: dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      status,
      urgent,
      diffDays
    };
  }).sort((a, b) => a.diffDays - b.diffDays); // Sort by closest due date

  const handleSave = () => {
    localStorage.setItem("pengingat_settings", JSON.stringify({ enabled, reminderDays, emailNotif }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

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

            <div className="flex items-center gap-4 p-4 bg-black/20 border border-white/5 rounded-2xl opacity-50 cursor-not-allowed select-none">
              <div className="w-5 h-5 rounded border-2 border-white/20 flex items-center justify-center" />
              <div className="text-gray-400"><Mail size={18} /></div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">Email</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Segera hadir</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-black/20 border border-white/5 rounded-2xl opacity-50 cursor-not-allowed select-none">
              <div className="w-5 h-5 rounded border-2 border-white/20 flex items-center justify-center" />
              <div className="text-gray-400"><MessageCircle size={18} /></div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">WhatsApp</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Segera hadir</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#D4AF37] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
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
            {upcomingDebts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-bold text-sm mb-2">Belum ada jadwal jatuh tempo</p>
                <p className="text-gray-600 text-xs mb-4">Tambahkan tanggal jatuh tempo di data hutangmu agar pengingat aktif.</p>
                <Link href="/dashboard/debts" className="text-gold text-xs font-black uppercase tracking-widest hover:underline">
                  Kelola Hutang →
                </Link>
              </div>
            ) : upcomingDebts.map((debt, idx) => (
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
