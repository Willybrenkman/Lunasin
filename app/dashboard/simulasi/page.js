"use client";

import { ArrowLeft, AlertTriangle, Brain } from "lucide-react";
import DebtChart from "@/components/DebtChart";
import { useEffect, useState, useMemo } from "react";
import { calculatePlan, simulate, detectNonConvergent } from "@/lib/calculate";
import { generateSimulasiInsight } from "@/lib/insight";
import Link from "next/link";
import { usePrivacy } from "@/components/privacy/PrivacyContext";
import Tooltip from "@/components/Tooltip";

export default function SimulasiPage() {
  const [chartData, setChartData] = useState([]);
  const [strategy, setStrategy] = useState("Smart Priority");
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [extraPaymentInput, setExtraPaymentInput] = useState("500000");
  const [extraPayment, setExtraPayment] = useState(500000);
  const { formatMoney } = usePrivacy();

  const nonConvergent = useMemo(() =>
    debts.length > 0 ? detectNonConvergent(debts) : [],
    [debts]
  );

  useEffect(() => {
    async function fetchDebts() {
      const cached = sessionStorage.getItem("debts_cache");
      if (cached) {
        setDebts(JSON.parse(cached));
        setLoading(false);
      }
      
      try {
        const response = await fetch("/api/debts");
        if (!response.ok) throw new Error("API error");
        const result = await response.json();
        setDebts(result.data || []);
        sessionStorage.setItem("debts_cache", JSON.stringify(result.data || []));
      } catch (e) {
        console.error(e);
        if (!cached) setFetchError(true);
      } finally {
        if (!cached) setLoading(false);
      }
    }
    fetchDebts();
  }, []);

  useEffect(() => {
    if (debts.length > 0) {
      const plan = calculatePlan(debts, strategy.toLowerCase(), extraPayment);
      setChartData(plan);
    }
  }, [strategy, debts, extraPayment]);

  const totalMinPayment = useMemo(() =>
    debts.filter(d => Number(d.sisa ?? d.total ?? 0) > 0)
      .reduce((s, d) => s + Number(d.min_payment || 0), 0),
    [debts]
  );

  const estimasiBulan = useMemo(() =>
    chartData.filter(d => d.total > 0).length || 0,
    [chartData]
  );

  const { simResult, simulasiInsight, whatIfData } = useMemo(() => {
    if (debts.length === 0) return { simResult: { months: 0, totalInterest: 0 }, simulasiInsight: "", whatIfData: [] };

    const stratKey = strategy.toLowerCase();
    const round10k = (n) => Math.round(n / 10000) * 10000;

    const baseline = simulate(debts, stratKey, 0);
    const current = extraPayment > 0 ? simulate(debts, stratKey, extraPayment) : baseline;

    const amounts = extraPayment > 0
      ? [0, round10k(extraPayment * 0.25), round10k(extraPayment * 0.5), extraPayment, round10k(extraPayment * 2)]
      : [0, 250000, 500000, 1000000, 1500000];

    const rows = amounts.map((extra) => {
      const sim = extra === 0 ? baseline : extra === extraPayment ? current : simulate(debts, stratKey, extra);
      return { extra, months: sim.months, totalInterest: sim.totalInterest, rawSavings: Math.max(0, baseline.totalInterest - sim.totalInterest) };
    });

    const maxSaved = rows[0].months - rows[rows.length - 1].months;
    let optimalIdx = 2;
    if (maxSaved > 0) {
      for (let i = 1; i < rows.length; i++) {
        if (rows[0].months - rows[i].months >= maxSaved * 0.6) { optimalIdx = i; break; }
      }
    }

    return {
      simResult: current,
      simulasiInsight: generateSimulasiInsight({
        months: current.months,
        totalInterest: current.totalInterest,
        baselineMonths: baseline.months,
        baselineInterest: baseline.totalInterest,
        extraPayment,
        strategy,
      }),
      whatIfData: rows.map((row, idx) => ({
        extra: formatMoney(row.extra),
        months: `${row.months} bulan`,
        totalInterest: formatMoney(row.totalInterest),
        savings: formatMoney(row.rawSavings),
        status: idx === optimalIdx ? "Optimal" : "",
        isCurrent: row.extra === extraPayment,
      })),
    };
  }, [debts, strategy, extraPayment, formatMoney]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  );

  if (fetchError) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-red-400 font-bold text-lg mb-2">Gagal memuat data</p>
      <p className="text-gray-600 text-sm mb-6">Periksa koneksi internetmu dan coba lagi.</p>
      <button onClick={() => window.location.reload()} className="bg-white/10 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
        Coba Lagi
      </button>
    </div>
  );

  if (debts.length === 0) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-gray-500 font-bold text-lg mb-2">Belum ada data hutang</p>
      <p className="text-gray-600 text-sm mb-6">Tambahkan hutang terlebih dahulu untuk menjalankan simulasi.</p>
      <Link href="/dashboard/add" className="bg-[#D4AF37] text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition-all">
        Tambah Hutang
      </Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 hover:bg-[#ffffff]/5 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </Link>
          <h1 className="text-[28px] font-black tracking-tight text-white">Hasil Simulasi</h1>
        </div>
      </div>

      {/* Non-Convergent Warning */}
      {nonConvergent.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex gap-4">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-black text-sm text-red-400 mb-2">Peringatan: Cicilan Tidak Mencukupi</p>
            <div className="space-y-1">
              {nonConvergent.map((d, i) => (
                <p key={i} className="text-xs text-gray-400">
                  <span className="font-bold text-white">{d.name}</span>: cicilan minimum {formatMoney(d.minPayment)} tidak cukup menutup bunga bulanan {formatMoney(d.monthlyInterest)}. Disarankan minimal {formatMoney(d.suggestedMin)}/bulan.
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Strategi Selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="luxury-card rounded-[2rem] p-8 h-full">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-widest mb-6 flex items-center">Pilih Strategi <Tooltip text="Strategi menentukan urutan hutang mana yang dilunasi duluan saat ada extra payment. Pilih yang sesuai kondisi dan prioritasmu." /></h3>
            <div className="space-y-3">
               <StrategyOption 
                  active={strategy === "Smart Priority"} 
                  onClick={() => setStrategy("Smart Priority")}
                  title="Smart Priority" 
                  desc="Rekomendasi terbaik untuk kamu." 
                  pro
                />
               <StrategyOption 
                  active={strategy === "Snowball"} 
                  onClick={() => setStrategy("Snowball")}
                  title="Snowball" 
                  desc="Mulai dari hutang terkecil dulu." 
                />
                <StrategyOption 
                  active={strategy === "Avalanche"} 
                  onClick={() => setStrategy("Avalanche")}
                  title="Avalanche" 
                  desc="Fokus bunga tertinggi dulu." 
                />
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest flex items-center">Extra Payment / bulan (Rp) <Tooltip text="Uang tambahan di atas cicilan minimum yang kamu bayar tiap bulan. Extra payment ini dialokasikan ke hutang prioritas teratas sesuai strategi yang dipilih." /></label>
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                   <input 
                     type="number"
                     value={extraPaymentInput}
                     onChange={(e) => setExtraPaymentInput(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-black outline-none focus:border-gold transition-colors"
                   />
                 </div>
              </div>
              <button 
                onClick={() => setExtraPayment(Number(extraPaymentInput) || 0)}
                className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest mt-2"
              >
                Jalankan Simulasi
              </button>
            </div>
          </div>
        </div>

        {/* Proyeksi Summary */}
        <div className="lg:col-span-8">
          <div className="luxury-card rounded-[2rem] p-8 h-full">
            <h3 className="font-bold text-sm text-white mb-6">Hasil Simulasi ({strategy})</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
               <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center">Estimasi Bebas Hutang <Tooltip text="Proyeksi berapa bulan lagi semua hutangmu lunas dengan strategi dan extra payment yang dipilih. Berubah otomatis saat kamu ganti strategi atau extra payment." /></p>
                 <p className="font-black text-white text-lg">{estimasiBulan > 0 ? `${estimasiBulan} bulan` : "-"}</p>
               </div>
               <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center">Total Bunga Terhitung <Tooltip text="Total bunga yang akan kamu bayar dari sekarang sampai lunas. Semakin besar extra payment atau semakin baik strateginya, angka ini makin kecil." /></p>
                 <p className="font-black text-white text-lg">{formatMoney(simResult.totalInterest)}</p>
                 <p className="text-[9px] text-gray-500 mt-1">Proyeksi bunga sampai lunas</p>
               </div>
               <div className="bg-[#22C55E]/10 p-5 rounded-2xl border border-[#22C55E]/20">
                 <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest mb-1 flex items-center">Total Cicilan / Bulan <Tooltip text="Jumlah cicilan minimum dari semua hutang aktifmu per bulan. Ini angka real dari data — bukan proyeksi. Kamu harus bayar minimal segini setiap bulan." /></p>
                 <p className="font-black text-[#22C55E] text-xl">{formatMoney(totalMinPayment)}</p>
                 <p className="text-[9px] text-[#22C55E] mt-1 opacity-80">Cicilan minimum dari semua hutang</p>
               </div>
            </div>
            
            {simulasiInsight && (
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl p-5 mb-6 flex gap-3">
                <Brain size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 font-medium leading-relaxed">{simulasiInsight}</p>
              </div>
            )}

            <div className="h-[400px]">
               <DebtChart data={chartData} strategy={strategy} onStrategyChange={setStrategy} />
            </div>
          </div>
        </div>

        {/* What-if Analysis */}
        <div className="lg:col-span-12">
          <div className="luxury-card rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="font-black text-sm text-white tracking-tight mb-1 uppercase tracking-widest flex items-center">Coba Berbagai Skenario Pembayaran <Tooltip text="Perbandingan otomatis 5 skenario extra payment di sekitar angka yang kamu input. Badge 'Saat ini' = extra payment aktifmu. Badge 'Optimal' = titik terbaik antara penghematan dan beban bayar." /></h3>
              <p className="text-xs text-gray-500 font-medium">Lihat bagaimana perubahan extra payment memengaruhi waktu lunas dan bunga.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20">
                  <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <th className="px-10 py-5">Extra / bln</th>
                    <th className="px-10 py-5">Durasi</th>
                    <th className="px-10 py-5">Total Bunga</th>
                    <th className="px-10 py-5">Hemat Bunga</th>
                    <th className="px-10 py-5">Rekomendasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {whatIfData.map((row, idx) => (
                    <tr key={idx} className={`group hover:bg-[#ffffff]/[0.02] transition-colors ${row.status ? 'bg-[#22C55E]/[0.05] border-l-4 border-[#22C55E]' : row.isCurrent ? 'bg-[#D4AF37]/[0.05] border-l-4 border-[#D4AF37]' : 'border-l-4 border-transparent'}`}>
                      <td className="px-10 py-6 font-bold text-white text-sm">
                        {row.extra}
                        {row.isCurrent && <span className="ml-2 bg-[#D4AF37] text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Saat ini</span>}
                      </td>
                      <td className="px-10 py-6 font-medium text-gray-400 text-sm">{row.months}</td>
                      <td className="px-10 py-6 font-medium text-gray-400 text-sm">{row.totalInterest}</td>
                      <td className="px-10 py-6 font-black text-[#22C55E] text-sm">{row.savings}</td>
                      <td className="px-10 py-6">
                        {row.status ? (
                          <span className="bg-[#22C55E] text-white text-[9px] font-black px-4 py-1.5 rounded-md uppercase tracking-widest">{row.status}</span>
                        ) : (
                          <span className="text-gray-600 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StrategyOption({ active, onClick, title, desc, pro }) {
  return (
    <div
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
        active
          ? "border-[#22C55E] bg-[#22C55E]/5"
          : "border-white/5 bg-black/20 hover:border-white/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-[#22C55E]" : "border-white/20"}`}>
          {active && <div className="w-2.5 h-2.5 bg-[#22C55E] rounded-full" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-white">{title}</p>
            {pro && <span className="bg-[#D4AF37] text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Rekomendasi</span>}
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
