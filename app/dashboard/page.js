"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { calculatePlan } from "@/lib/calculate";
const DebtChart = dynamic(() => import("@/components/DebtChart"), { ssr: false });
import {
  Wallet, TrendingUp, Calendar, Plus,
  Pencil, BarChart3, Crown,
  Brain, Trophy, FileText, Share2
} from "lucide-react";
import Link from "next/link";
import { generateInsight } from "@/lib/insight";
import { simulate, detectNonConvergent } from "@/lib/calculate";
import { getDebtTypeConfig } from "@/lib/debtTypes";
import { recommend } from "@/lib/recommendation";
import { getAchievements } from "@/lib/achievement";
import DebtCalendar from "@/components/DebtCalendar";
import { usePrivacy } from "@/components/privacy/PrivacyContext";
import Tooltip from "@/components/Tooltip";

export default function Dashboard() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraPayment, setExtraPayment] = useState(500000);
  const [extraPaymentInput, setExtraPaymentInput] = useState("500000");
  const [editingExtra, setEditingExtra] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [strategy, setStrategy] = useState("Smart Priority");
  const [insight, setInsight] = useState("");
  const [recommendationMsg, setRecommendationMsg] = useState("");
  const [achievements, setAchievements] = useState([]);
  const [simMonths, setSimMonths] = useState(0);
  const [nonConvergent, setNonConvergent] = useState([]);
  const [shareModal, setShareModal] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const { formatMoney } = usePrivacy();

  // Fetch data sekali saat mount
  useEffect(() => {
    async function fetchData() {
      const cached = sessionStorage.getItem("debts_cache");
      if (cached) {
        setDebts(JSON.parse(cached));
        setLoading(false);
      }
      try {
        const response = await fetch("/api/debts");
        if (!response.ok) throw new Error("API error");
        const result = await response.json();
        const data = result.data || [];
        setDebts(data);
        sessionStorage.setItem("debts_cache", JSON.stringify(data));
      } catch (e) {
        // Network error — tetap tampilkan data dari cache jika ada
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Hitung ulang chart setiap kali debts, strategy, atau extraPayment berubah
  useEffect(() => {
    if (debts.length > 0) {
      const strategyKey = strategy === "Smart Priority" ? "smart priority" : strategy.toLowerCase();
      const plan = calculatePlan(debts, strategyKey, extraPayment);
      setChartData(plan);
      const strategyForSim = strategy === "Smart Priority" ? "smart priority" : strategy.toLowerCase();
      const simSummary = simulate(debts, strategyForSim, extraPayment);
      setSimMonths(simSummary.months);
      setInsight(generateInsight({ months: simSummary.months, totalInterest: simSummary.totalInterest, extraPayment, strategy }));
      setRecommendationMsg(recommend(debts));
      setNonConvergent(detectNonConvergent(debts));

      const totalAwal = debts.reduce((s, d) => s + Number(d.total || 0), 0);
      const totalSisa = debts.reduce((s, d) => s + Number(d.sisa ?? d.total ?? 0), 0);
      const progressRaw = totalAwal > 0 ? Math.round(((totalAwal - totalSisa) / totalAwal) * 100) : 0;
      const progress = Math.max(0, Math.min(100, progressRaw));
      const paidOff = debts.filter(d => {
        const isPaidStatus = d.status === 'paid_off';
        const isSisaZero = d.sisa !== null && d.sisa !== undefined && Number(d.sisa) <= 0 && Number(d.total) > 0;
        return isPaidStatus || isSisaZero;
      }).length;
      setAchievements(getAchievements({ paidOff, progress }));
    } else {
      setAchievements(getAchievements({ paidOff: 0, progress: 0 }));
    }
  }, [strategy, debts, extraPayment]);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="luxury-card rounded-3xl p-6 h-[120px]">
            <div className="h-3 w-24 bg-white/10 rounded mb-4" />
            <div className="h-7 w-32 bg-white/10 rounded mb-2" />
            <div className="h-2 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 luxury-card rounded-[2rem] h-[340px]" />
        <div className="luxury-card rounded-[2rem] h-[340px]" />
      </div>
    </div>
  );

  // Compute summary stats from actual data
  const totalHutang = debts.reduce((s, d) => s + Number(d.total || 0), 0);
  const sisaHutang = debts.reduce((s, d) => s + Number(d.sisa ?? d.total ?? 0), 0);
  const progressPctRaw = totalHutang > 0 ? Math.round(((totalHutang - sisaHutang) / totalHutang) * 100) : 0;
  const progressPct = Math.max(0, Math.min(100, progressPctRaw)); // Clamp between 0-100

  if (debts.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700 space-y-6">
      <div className="w-24 h-24 rounded-3xl bg-gold/10 border border-gold/20 flex items-center justify-center text-5xl">
        💳
      </div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Belum ada hutang tercatat</h2>
        <p className="text-gray-500 max-w-sm leading-relaxed">
          Mulai catat hutangmu sekarang dan biarkan Lunasin membantumu melunasinya lebih cepat.
        </p>
      </div>
      <Link href="/dashboard/add">
        <button className="flex items-center gap-2 bg-[#D4AF37] text-black font-black px-8 py-4 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] text-sm uppercase tracking-widest">
          <Plus size={18} /> Tambah Hutang Pertama
        </button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Non-convergent warning */}
      {nonConvergent.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
          <p className="text-sm font-black text-red-400 mb-2">⚠️ Peringatan: {nonConvergent.length} hutang tidak akan pernah lunas</p>
          <p className="text-xs text-gray-400 mb-3">Cicilan minimum lebih kecil dari bunga bulanan — hutang ini terus bertambah meski dibayar rutin.</p>
          <div className="space-y-1">
            {nonConvergent.map((d, i) => (
              <p key={i} className="text-xs text-gray-300">
                <span className="font-bold text-white">{d.name}</span>: cicilan min{" "}
                <span className="text-red-400">Rp {d.minPayment.toLocaleString("id-ID")}</span> &lt; bunga bulanan{" "}
                <span className="text-red-400">Rp {d.monthlyInterest.toLocaleString("id-ID")}</span> — naikkan ke minimal{" "}
                <span className="text-gold font-bold">Rp {d.suggestedMin.toLocaleString("id-ID")}</span>
              </p>
            ))}
          </div>
        </div>
      )}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Hutang" tooltip="Jumlah semua hutang awal yang pernah kamu catat, sebelum ada pembayaran apapun." value={formatMoney(totalHutang)} sub={`${debts.length} hutang aktif`} icon={<Wallet size={20} />} color="text-purple-400" bgColor="bg-purple-500/10" />
        <StatCard label="Sisa Hutang" tooltip="Total hutang yang belum terbayar sampai hari ini. Angka ini berkurang setiap kamu mencatat pembayaran." value={formatMoney(sisaHutang)} sub={totalHutang > 0 ? `${((sisaHutang / totalHutang) * 100).toFixed(1)}% dari total` : "0%"} icon={<BarChart3 size={20} />} color="text-green-400" bgColor="bg-green-500/10" />
        <StatCard label="Estimasi Lunas" tooltip="Proyeksi berapa bulan lagi kamu bebas hutang, dihitung berdasarkan strategi dan extra payment yang dipilih. Bukan angka pasti — berubah sesuai simulasimu." value={simMonths > 0 ? `${simMonths} bulan` : "-"} sub="" icon={<Calendar size={20} />} color="text-blue-400" bgColor="bg-blue-500/10" />

        {/* Progress Card */}
        <div className="luxury-card rounded-3xl p-6 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">Progress <Tooltip text="Persentase hutang yang sudah terbayar. Dihitung dari (Total Hutang - Sisa Hutang) / Total Hutang × 100%. Semakin tinggi semakin baik." /></p>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-black mb-4 text-white">{progressPct}%</h3>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#22C55E] h-full rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Chart + Strategy Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2">
          <div className="h-full luxury-card rounded-[2rem] p-8">
            <DebtChart
              data={chartData}
              strategy={strategy}
              onStrategyChange={setStrategy}
            />
          </div>
        </div>

        {/* Strategy Column */}
        <div>
          <div className="luxury-card-highlight rounded-[2rem] p-8 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[10px] mb-6 text-gray-500 uppercase tracking-widest flex items-center">Strategi Terbaik Untuk Kamu <Tooltip text="Lunasin merekomendasikan strategi berdasarkan kombinasi bunga, sisa hutang, dan cicilan minimummu. Kamu bisa ganti strategi dari grafik." /></h3>

              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Crown size={18} className="text-gold" />
                  <h4 className="font-black text-base text-gold">Smart Priority</h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  {recommendationMsg || "Strategi ini berdasarkan kondisi hutangmu untuk mempercepat pelunasan dan menghemat bunga."}
                </p>
              </div>

              {/* AI Insight Box */}
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl p-5 mb-6">
                 <div className="flex items-center gap-2 mb-2">
                   <Brain size={16} className="text-[#22C55E]" />
                   <h4 className="font-black text-xs text-[#22C55E] uppercase tracking-widest">Insight Keuangan</h4>
                 </div>
                 <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                   {insight || "Memproses data finansialmu..."}
                 </p>
              </div>

              <Link href="/dashboard/simulasi" className="text-[11px] font-black text-gold uppercase tracking-widest hover:underline mb-6 block">
                Lihat Rencana Lengkap →
              </Link>
            </div>

            <div className="space-y-4 mt-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center">Extra Payment / bulan <Tooltip text="Jumlah tambahan di atas cicilan minimum yang bisa kamu bayar tiap bulan. Semakin besar extra payment, semakin cepat lunas dan semakin hemat bunga." /></label>
                {editingExtra ? (
                  <input
                    type="number"
                    value={extraPaymentInput}
                    onChange={(e) => setExtraPaymentInput(e.target.value)}
                    onBlur={() => {
                      setEditingExtra(false);
                      setExtraPayment(Number(extraPaymentInput) || 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setEditingExtra(false);
                        setExtraPayment(Number(extraPaymentInput) || 0);
                      }
                    }}
                    autoFocus
                    className="w-full bg-black/40 border border-gold rounded-2xl py-3 px-4 text-white font-black outline-none"
                  />
                ) : (
                  <div
                    onClick={() => setEditingExtra(true)}
                    className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <p className="font-black text-white text-lg">{formatMoney(extraPayment)}</p>
                    <Pencil size={16} className="text-gray-500 hover:text-white transition-colors" />
                  </div>
                )}
              </div>
              <button
                onClick={() => { setExtraPayment(Number(extraPaymentInput) || 0); setEditingExtra(false); }}
                className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Jalankan Simulasi
              </button>
              <Link href="/dashboard/simulasi" className="block text-center text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors pt-2">
                Lihat Simulasi Skenario →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Debt Calendar */}
        <div className="lg:col-span-1">
           <DebtCalendar debts={debts} />
        </div>

        {/* Monthly Report & Share */}
        <div className="lg:col-span-1">
          <div className="luxury-card rounded-[2rem] p-8 h-full flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-0"></div>
             <div className="relative z-10">
               <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">Monthly Financial Report</h3>
               <p className="text-xl font-black text-white flex items-center gap-2 mb-6">
                 <FileText size={20} className="text-blue-400" /> Ringkasan Bulan Ini
               </p>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Sudah Terbayar</span>
                    <span className="text-sm font-black text-[#22C55E]">{formatMoney(totalHutang - sisaHutang)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Sisa Hutang</span>
                    <span className="text-sm font-black text-gold">{formatMoney(sisaHutang)}</span>
                  </div>
               </div>
             </div>
             
             <button
               onClick={() => setShareModal(true)}
               className="mt-8 w-full bg-blue-600/20 text-blue-400 font-black py-4 rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 relative z-10"
             >
               <Share2 size={16} /> Bagikan Hasil Saya
             </button>
          </div>
        </div>

        {/* Gamification / Achievement */}
        <div className="lg:col-span-1">
          <div className="luxury-card rounded-[2rem] p-8 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -z-0"></div>
             <div className="relative z-10">
               <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">Achievement</h3>
               <p className="text-xl font-black text-white flex items-center gap-2 mb-6">
                 <Trophy size={20} className="text-purple-400" /> Badge Kehormatan
               </p>
               
               <div className="space-y-3">
                 {achievements.map((badge, idx) => (
                   <div key={idx} className="flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-transparent p-4 rounded-2xl border border-purple-500/20">
                     <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">
                       {badge.split(' ').pop()}
                     </div>
                     <span className="font-bold text-sm text-white">{badge.replace(/ [^ ]*$/, '')}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

      </div>

      {/* Share to WhatsApp Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="luxury-card rounded-[2rem] p-8 w-full max-w-md">
            <h3 className="font-black text-lg text-white mb-1">Bagikan ke WhatsApp</h3>
            <p className="text-xs text-gray-500 mb-6">Masukkan nomor WA tujuan. Ringkasan hutangmu akan dikirim otomatis.</p>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+62</span>
              <input
                type="tel"
                placeholder="8123456789"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-14 pr-4 text-white font-bold outline-none focus:border-gold transition-colors"
              />
            </div>
            <div className="bg-black/30 rounded-xl p-4 mb-6 text-xs text-gray-400 leading-relaxed whitespace-pre-line">
              {`📊 *Laporan Hutangku — Lunasin.id*\n\n💰 Total Hutang: ${formatMoney(totalHutang)}\n📉 Sisa Hutang: ${formatMoney(sisaHutang)}\n✅ Progress: ${progressPct}%\n⏱ Estimasi Lunas: ${simMonths > 0 ? `${simMonths} bulan` : "-"}\n📌 Strategi: ${strategy}\n\nYuk bebas hutang! 🎯\nlunasin.id`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShareModal(false); setWaNumber(""); }}
                className="flex-1 bg-white/5 text-gray-400 font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!waNumber) return;
                  const nomor = waNumber.startsWith("0") ? `62${waNumber.slice(1)}` : waNumber.startsWith("62") ? waNumber : `62${waNumber}`;
                  const pesan = `📊 *Laporan Hutangku — Lunasin.id*\n\n💰 Total Hutang: ${formatMoney(totalHutang)}\n📉 Sisa Hutang: ${formatMoney(sisaHutang)}\n✅ Progress: ${progressPct}%\n⏱ Estimasi Lunas: ${simMonths > 0 ? `${simMonths} bulan` : "-"}\n📌 Strategi: ${strategy}\n\nYuk bebas hutang! 🎯\nlunasin.id`;
                  window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`, "_blank");
                  setShareModal(false);
                  setWaNumber("");
                }}
                className="flex-1 bg-[#25D366] text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Kirim ke WA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debt Table Section — Now dynamic from fetched data */}
      <div className="luxury-card rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black text-xl text-white">Daftar Hutang</h3>
          <Link href="/dashboard/add">
            <button className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 py-2.5 px-6 rounded-xl transition-all border border-white/10">
              <Plus size={16} /> Tambah Hutang
            </button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/20">
                <th className="px-8 py-5">Nama Hutang</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Sisa</th>
                <th className="px-8 py-5">Tagihan</th>
                <th className="px-8 py-5">Bunga</th>
                <th className="px-8 py-5">Minimum / bln</th>
                <th className="px-8 py-5">Durasi (Mulai - Selesai)</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {debts.map((d) => {
                const tc = getDebtTypeConfig(d.debt_type);
                const displayRate = tc.reverseConvert(Number(d.interest));
                const unitMap = { annual: "%/thn", monthly: "%/bln", flat_annual: "%flat/thn", daily: "%/hari" };
                const rateStr = (Number.isInteger(displayRate) ? displayRate : displayRate.toFixed(2).replace(/\.?0+$/, "")) + (unitMap[tc.rateType] || "%/thn");
                return (
                  <DebtRow
                    key={d.id}
                    name={d.name}
                    total={formatMoney(d.total)}
                    sisa={formatMoney(d.sisa ?? d.total)}
                    tanggalTagihan={d.tanggal_tagihan}
                    interest={rateStr}
                    min={formatMoney(d.min_payment)}
                    tanggalMulai={d.tanggal_mulai}
                    jatuhTempo={d.jatuh_tempo}
                    status={d.status}
                    sisaRaw={Number(d.sisa ?? d.total)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DebtRow({ name, total, sisa, tanggalTagihan, interest, min, tanggalMulai, jatuhTempo, status, sisaRaw }) {
  const isPaid = status === 'paid_off' || sisaRaw <= 0;

  return (
    <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
      <td className="px-8 py-6 font-bold text-white text-sm group-hover:text-[#22C55E]">{name}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">{total}</td>
      <td className="px-8 py-6 font-bold text-white text-sm">{sisa}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400 font-bold">{tanggalTagihan ? `Tgl ${tanggalTagihan}` : "-"}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">{interest}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">{min}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">
        <div className="flex flex-col">
          <span>Mulai: {tanggalMulai ? new Date(tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
          <span className="text-gold">Selesai: {jatuhTempo ? new Date(jatuhTempo).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        {isPaid ? (
          <span className="inline-block px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-black rounded-md uppercase tracking-widest border border-[#22C55E]/20">Lunas</span>
        ) : (
          <span className="inline-block px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black rounded-md uppercase tracking-widest border border-white/10">Aktif</span>
        )}
      </td>
    </tr>
  );
}

function StatCard({ label, tooltip, value, sub, icon, color, bgColor }) {
  return (
    <div className="luxury-card rounded-3xl p-6 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">{label}{tooltip && <Tooltip text={tooltip} />}</p>
        <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black mb-1 text-white tracking-tight">{value}</h3>
      <p className="text-[11px] text-gray-500 font-bold">{sub}</p>
    </div>
  );
}
