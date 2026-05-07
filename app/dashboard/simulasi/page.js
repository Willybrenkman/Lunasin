"use client";

import { 
  Download, Share2, ArrowLeft, Crown
} from "lucide-react";
import DebtChart from "@/components/DebtChart";
import { useEffect, useState } from "react";
import { calculatePlan } from "@/lib/calculate";
import Link from "next/link";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function SimulasiPage() {
  const [chartData, setChartData] = useState([]);
  const [strategy, setStrategy] = useState("Smart Priority");
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatMoney } = usePrivacy();

  useEffect(() => {
    async function fetchDebts() {
      try {
        const response = await fetch("/api/debts");
        const result = await response.json();
        setDebts(result.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDebts();
  }, []);

  useEffect(() => {
    if (debts.length > 0) {
      const plan = calculatePlan(debts, strategy.toLowerCase(), 500000);
      setChartData(plan);
    }
  }, [strategy, debts]);

  // Hitung summary dari data real
  const totalSisa = debts.reduce((s, d) => s + Number(d.sisa || d.total || 0), 0);
  const totalMinPayment = debts.reduce((s, d) => s + Number(d.min_payment || 0), 0);
  const estimasiBulan = chartData.length || 0;

  // Hitung what-if analysis dari data real
  const extraAmounts = [0, 250000, 500000, 1000000, 1500000];
  const baselineMonths = totalMinPayment > 0 ? Math.ceil(totalSisa / totalMinPayment) : 0;

  const whatIfData = debts.length > 0 ? extraAmounts.map((extra, idx) => {
    const monthlyTotal = totalMinPayment + extra;
    const months = monthlyTotal > 0 ? Math.ceil(totalSisa / monthlyTotal) : 0;
    const avgInterest = debts.reduce((s, d) => s + Number(d.interest || 0), 0) / debts.length;
    const estInterest = Math.round(totalSisa * (avgInterest / 100 / 12) * months);
    const baseInterest = Math.round(totalSisa * (avgInterest / 100 / 12) * baselineMonths);
    const savings = baseInterest - estInterest;

    return {
      extra: formatMoney(extra),
      months: `${months} bulan`,
      totalInterest: formatMoney(estInterest),
      savings: formatMoney(Math.max(savings, 0)),
      status: idx === 2 ? "Optimal" : "",
    };
  }) : [];

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
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

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Strategi Selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="luxury-card rounded-[2rem] p-8 h-full">
            <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-widest mb-6">Pilih Strategi</h3>
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
              <div className="flex justify-between items-center">
                 <p className="text-[11px] text-gray-500 font-bold">Extra Payment / bulan</p>
                 <p className="text-sm font-black text-white">{formatMoney("500000")}</p>
              </div>
              <button className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all text-xs uppercase tracking-widest mt-2">
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
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Estimasi Bebas Hutang</p>
                 <p className="font-black text-white text-lg">{estimasiBulan > 0 ? `${estimasiBulan} bulan` : "-"}</p>
               </div>
               <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Sisa Hutang</p>
                 <p className="font-black text-white text-lg">{formatMoney(totalSisa)}</p>
               </div>
               <div className="bg-[#22C55E]/10 p-5 rounded-2xl border border-[#22C55E]/20">
                 <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest mb-1">Total Cicilan / Bulan</p>
                 <p className="font-black text-[#22C55E] text-xl">{formatMoney(totalMinPayment)}</p>
                 <p className="text-[9px] text-[#22C55E] mt-1 opacity-80">Cicilan minimum dari semua hutang</p>
               </div>
            </div>
            
            <div className="h-[400px]">
               <DebtChart data={chartData} />
            </div>
          </div>
        </div>

        {/* What-if Analysis */}
        <div className="lg:col-span-12">
          <div className="luxury-card rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="font-black text-sm text-white tracking-tight mb-1 uppercase tracking-widest">Coba Berbagai Skenario Pembayaran</h3>
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
                    <tr key={idx} className={`group hover:bg-[#ffffff]/[0.02] transition-colors ${row.status ? 'bg-[#22C55E]/[0.05] border-l-4 border-[#22C55E]' : 'border-l-4 border-transparent'}`}>
                      <td className="px-10 py-6 font-bold text-white text-sm">{row.extra}</td>
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
          </div>
          <p className="text-[10px] font-medium text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
