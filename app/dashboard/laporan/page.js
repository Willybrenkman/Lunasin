"use client";

import { useEffect, useState } from "react";
import { Download, TrendingDown, Wallet, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from "@/lib/supabase";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const { formatMoney } = usePrivacy();
  const tabs = ["Ringkasan", "Timeline", "Pembayaran", "PDF / Export"];

  useEffect(() => {
    async function fetchData() {
      const cachedDebts = sessionStorage.getItem("debts_cache");
      const cachedPayments = sessionStorage.getItem("payments_cache");
      
      if (cachedDebts) setDebts(JSON.parse(cachedDebts));
      if (cachedPayments) setPayments(JSON.parse(cachedPayments));
      if (cachedDebts && cachedPayments) setLoading(false);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (!cachedDebts) setLoading(false); return; }

        // Fetch debts
        const { data: debtsData } = await supabase
          .from("debts")
          .select("*")
          .eq("user_id", user.id);
        if (debtsData) {
          setDebts(debtsData);
          sessionStorage.setItem("debts_cache", JSON.stringify(debtsData));
        }

        // Fetch payments (last 6 months)
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("payment_date", { ascending: true });
        if (paymentsData) {
          setPayments(paymentsData);
          sessionStorage.setItem("payments_cache", JSON.stringify(paymentsData));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cachedDebts || !cachedPayments) setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute stats from real data
  const totalHutang = debts.reduce((s, d) => s + Number(d.total || 0), 0);
  const sisaHutang = debts.reduce((s, d) => s + Number(d.sisa ?? d.total ?? 0), 0);
  const totalTerbayar = Math.max(0, totalHutang - sisaHutang);
  const penurunanPctRaw = totalHutang > 0 ? (totalTerbayar / totalHutang) * 100 : 0;
  const penurunanPct = Math.max(0, Math.min(100, penurunanPctRaw)).toFixed(1);
  const totalMinPayment = debts.reduce((s, d) => s + Number(d.min_payment || 0), 0);
  const estimasiBulan = totalMinPayment > 0 ? Math.ceil(sisaHutang / totalMinPayment) : 0;
  const avgInterest = debts.length > 0 ? debts.reduce((s, d) => s + Number(d.interest || 0), 0) / debts.length : 0;
  const estTotalBunga = Math.round(sisaHutang * (avgInterest / 100 / 12) * estimasiBulan);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  // Build chart data from payments grouped by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const chartData = (() => {
    if (payments.length === 0) return [];
    const grouped = {};
    payments.forEach(p => {
      const d = new Date(p.payment_date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = monthNames[d.getMonth()];
      if (!grouped[key]) grouped[key] = { name: label, amount: 0 };
      grouped[key].amount += Number(p.amount || 0);
    });
    return Object.values(grouped).slice(-6); // Last 6 months
  })();

  // Health score based on real data
  const dtiRatio = totalMinPayment > 0 ? Math.min(100, Math.round((totalTerbayar / totalHutang) * 100)) : 0;
  const healthScore = Math.min(100, Math.max(0, dtiRatio + (debts.length > 0 ? 20 : 0) + (payments.length > 0 ? 15 : 0)));

  const getHealthLabel = (score) => {
    if (score >= 80) return { label: "Sehat", color: "text-[#22C55E]" };
    if (score >= 60) return { label: "Cukup Baik", color: "text-gold" };
    if (score >= 40) return { label: "Waspada", color: "text-gold" };
    return { label: "Perlu Perhatian", color: "text-red-400" };
  };
  const health = getHealthLabel(healthScore);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Tab Navigation */}
      <div className="flex gap-8 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab ? "text-gold" : "text-gray-500 hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-t-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <ReportStat label="Penurunan Hutang" value={`${penurunanPct}%`} sub={debts.length > 0 ? `${formatMoney(totalTerbayar)} terbayar` : "Belum ada data"} icon={<TrendingDown size={20} />} color="text-green-400" bgColor="bg-green-500/10" />
            <ReportStat label="Total Pembayaran" value={formatMoney(totalPaid)} sub={`${payments.length} transaksi`} icon={<Calendar size={20} />} color="text-blue-400" bgColor="bg-blue-500/10" />
            <ReportStat label="Cicilan / Bulan" value={formatMoney(totalMinPayment)} sub={`${debts.length} hutang aktif`} icon={<Wallet size={20} />} color="text-purple-400" bgColor="bg-purple-500/10" />
          </div>

          <div className="luxury-card p-8 rounded-[2rem]">
            <h3 className="font-bold text-sm mb-8 tracking-widest uppercase text-gray-500">Ringkasan Laporan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <SummarySmall label="Estimasi Bebas" value={estimasiBulan > 0 ? `${estimasiBulan} Bulan` : "-"} />
              <SummarySmall label="Est. Total Bunga" value={formatMoney(estTotalBunga)} />
              <SummarySmall label="Total Terbayar" value={formatMoney(totalTerbayar)} color="text-[#22C55E]" />
              <SummarySmall label="Sisa Hutang" value={formatMoney(sisaHutang)} />
            </div>
            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} tickFormatter={(v) => `${v/1000000}jt`} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#0F1319', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}} formatter={(v) => formatMoney(v)} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#D4AF37' : '#1E293B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-600 text-sm font-medium">Belum ada data pembayaran untuk ditampilkan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Debt Health Score */}
        <div className="space-y-8">
          <div className="luxury-card p-8 rounded-[2rem] h-full flex flex-col">
            <h3 className="font-bold text-[11px] mb-8 tracking-widest text-gray-500 uppercase text-center">Skor Kesehatan Hutang</h3>
            <div className="flex flex-col items-center text-center py-4 flex-1">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - healthScore / 100)} strokeLinecap="round" className="text-gold" style={{filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))'}} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{healthScore}</span>
                  <span className="text-gray-500 font-bold text-[10px] mt-1">/ 100</span>
                </div>
              </div>
              <div className="mt-6">
                <span className={`bg-gold/10 border border-gold/20 ${health.color} px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-[0_0_10px_rgba(212,175,55,0.1)]`}>{health.label}</span>
                <p className="text-gray-400 font-medium text-[11px] mt-4 leading-relaxed px-4">
                  {healthScore >= 60 
                    ? "Kondisi hutangmu cukup sehat. Terus pertahankan pembayaran rutin." 
                    : "Kondisi hutangmu perlu perhatian. Pastikan membayar cicilan tepat waktu."}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Faktor Penilaian</p>
              <HealthFactor label="Progres Pelunasan" status={penurunanPct > 30 ? "Baik" : penurunanPct > 10 ? "Cukup" : "Perlu Ditingkatkan"} color={penurunanPct > 30 ? "text-[#22C55E]" : penurunanPct > 10 ? "text-gold" : "text-red-400"} />
              <HealthFactor label="Riwayat Pembayaran" status={payments.length > 3 ? "Baik" : payments.length > 0 ? "Cukup" : "Belum Ada"} color={payments.length > 3 ? "text-[#22C55E]" : payments.length > 0 ? "text-gold" : "text-red-400"} />
              <HealthFactor label="Jumlah Hutang Aktif" status={debts.length <= 3 ? "Baik" : debts.length <= 6 ? "Cukup" : "Banyak"} color={debts.length <= 3 ? "text-[#22C55E]" : debts.length <= 6 ? "text-gold" : "text-red-400"} />
              <HealthFactor label="Rata-rata Bunga" status={avgInterest < 10 ? "Rendah" : avgInterest < 20 ? "Sedang" : "Tinggi"} color={avgInterest < 10 ? "text-[#22C55E]" : avgInterest < 20 ? "text-gold" : "text-red-400"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, sub, icon, color, bgColor }) {
  return (
    <div className="luxury-card p-6 rounded-[1.5rem]">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <div className={`p-2 rounded-xl ${bgColor} ${color}`}>{icon}</div>
      </div>
      <h3 className="text-xl font-black mb-1 text-white tracking-tight">{value}</h3>
      <p className="text-[10px] text-gray-500 font-bold">{sub}</p>
    </div>
  );
}

function SummarySmall({ label, value, color = "text-white" }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`font-black text-base ${color}`}>{value}</p>
    </div>
  );
}

function HealthFactor({ label, status, color }) {
  return (
    <div className="flex justify-between items-center group cursor-default p-2 hover:bg-[#ffffff]/[0.02] rounded-lg transition-colors -mx-2">
      <span className="text-[11px] font-bold text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{status}</span>
        <ChevronRight size={12} className="text-white/20 group-hover:text-gold transition-colors" />
      </div>
    </div>
  );
}
