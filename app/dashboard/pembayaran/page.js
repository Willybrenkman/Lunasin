"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ArrowUpRight, Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function Pembayaran() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBulanIni, setTotalBulanIni] = useState(0);
  const { formatMoney } = usePrivacy();

  useEffect(() => {
    async function fetchPayments() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Ambil riwayat pembayaran dari Supabase
        const { data, error } = await supabase
          .from("payments")
          .select("*, debts(name)")
          .eq("user_id", user.id)
          .order("payment_date", { ascending: false })
          .limit(20);

        if (!error && data) {
          setPayments(data);
          // Hitung total bulan ini
          const now = new Date();
          const thisMonth = data.filter(p => {
            const d = new Date(p.payment_date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
          setTotalBulanIni(thisMonth.reduce((s, p) => s + Number(p.amount || 0), 0));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0F1319] text-white p-8 rounded-[2rem] relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-2 font-bold uppercase tracking-widest text-[10px]">Total Terbayar Bulan Ini</p>
            <h3 className="text-4xl font-black mb-6">{formatMoney(totalBulanIni)}</h3>
            <button className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all">
              Bayar Sekarang <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gold/5 blur-3xl rounded-full" />
        </div>

        <div className="bg-[#0F1319] border border-white/5 p-8 rounded-[2rem] flex flex-col justify-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Ringkasan Pembayaran</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-medium">Total transaksi</span>
              <span className="font-black text-white text-sm">{payments.length} pembayaran</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-medium">Total dibayar keseluruhan</span>
              <span className="font-black text-white text-sm">{formatMoney(payments.reduce((s, p) => s + Number(p.amount || 0), 0))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0F1319] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black text-lg text-white">Riwayat Transaksi</h3>
          <button className="text-[10px] font-black text-gray-500 flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest">
            <Download size={16} /> Export CSV
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Tanggal</th>
              <th className="px-8 py-5">Tujuan</th>
              <th className="px-8 py-5">Jumlah</th>
              <th className="px-8 py-5">Catatan</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <p className="text-gray-500 font-bold text-sm mb-2">Belum ada riwayat pembayaran</p>
                  <p className="text-gray-600 text-xs">Pembayaran akan muncul di sini setelah kamu mencatat cicilan.</p>
                </td>
              </tr>
            ) : payments.map((t) => (
              <tr key={t.id} className="hover:bg-[#ffffff]/[0.02] transition-colors group">
                <td className="px-8 py-5 text-sm text-gray-400 font-medium">{formatDate(t.payment_date)}</td>
                <td className="px-8 py-5 font-black text-sm text-white">{t.debts?.name || "-"}</td>
                <td className="px-8 py-5 font-black text-white text-sm">{formatMoney(t.amount)}</td>
                <td className="px-8 py-5 text-sm text-gray-500 font-medium">{t.notes || "-"}</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 text-[#22C55E] font-black text-[10px] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-md uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Berhasil
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
