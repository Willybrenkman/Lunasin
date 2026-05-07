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
  const { formatMoney } = usePrivacy();

  useEffect(() => {
    async function fetchDebts() {
      try {
        const response = await fetch("/api/debts");
        const result = await response.json();
        setDebts(result.data || []);
      } catch (e) {
        console.error(e);
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

  const whatIfData = [
    { extra: formatMoney("0"), months: "24 bulan", totalInterest: formatMoney("4050000"), savings: formatMoney("0"), status: "" },
    { extra: formatMoney("250000"), months: "18 bulan", totalInterest: formatMoney("2650000"), savings: formatMoney("1400000"), status: "" },
    { extra: formatMoney("500000"), months: "14 bulan", totalInterest: formatMoney("1750000"), savings: formatMoney("2300000"), status: "Optimal" },
    { extra: formatMoney("1020000"), months: "10 bulan", totalInterest: formatMoney("950000"), savings: formatMoney("3100000"), status: "" },
    { extra: formatMoney("1500000"), months: "7 bulan", totalInterest: formatMoney("550000"), savings: formatMoney("3500000"), status: "" },
  ];

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
                 <p className="font-black text-white text-lg">14 bulan</p>
                 <p className="text-[11px] text-gray-400 mt-0.5">(Februari 2026)</p>
               </div>
               <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Bunga Dibayar</p>
                 <p className="font-black text-white text-lg">{formatMoney("1750000")}</p>
               </div>
               <div className="bg-[#22C55E]/10 p-5 rounded-2xl border border-[#22C55E]/20">
                 <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest mb-1">Total Bunga Hemat</p>
                 <p className="font-black text-[#22C55E] text-xl">{formatMoney("2300000")}</p>
                 <p className="text-[9px] text-[#22C55E] mt-1 opacity-80">Dibandingkan pembayaran minimum</p>
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
              <h3 className="font-black text-xl text-white tracking-tight mb-1 uppercase text-sm tracking-widest">Coba Berbagai Skenario Pembayaran</h3>
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
