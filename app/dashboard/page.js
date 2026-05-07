"use client";

import { useEffect, useState } from "react";
import { calculatePlan } from "@/lib/calculate";
import DebtChart from "@/components/DebtChart";
import {
  Wallet, TrendingUp, Calendar, Plus,
  Pencil, ChevronRight, BarChart3, Crown,
  Brain, Trophy, FileText, Share2, Target
} from "lucide-react";
import Link from "next/link";
import { generateInsight } from "@/lib/insight";
import { recommend } from "@/lib/recommendation";
import { getAchievements } from "@/lib/achievement";
import DebtCalendar from "@/components/DebtCalendar";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function Dashboard() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraPayment, setExtraPayment] = useState(500000);
  const [chartData, setChartData] = useState([]);
  const [strategy, setStrategy] = useState("Smart Priority");
  const [insight, setInsight] = useState("");
  const [recommendationMsg, setRecommendationMsg] = useState("");
  const [achievements, setAchievements] = useState([]);
  const { formatMoney } = usePrivacy();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/debts");
        const result = await response.json();
        const data = result.data || [];
        setDebts(data);

        if (data.length > 0) {
          const plan = calculatePlan(data, "snowball", extraPayment);
          setChartData(plan);
          
          // Calculate premium features
          setInsight(generateInsight({ months: plan.length, totalInterest: plan.reduce((s, p) => s + p.total, 0) }));
          setRecommendationMsg(recommend(data));
          setAchievements(getAchievements({ paidOff: 1, progress: 35 }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [extraPayment]);

  if (loading) return null;

  // Compute summary stats from actual data
  const totalHutang = debts.reduce((s, d) => s + Number(d.total || 0), 0);
  const sisaHutang = debts.reduce((s, d) => s + Number(d.sisa || d.total || 0), 0);
  const progressPct = totalHutang > 0 ? Math.round(((totalHutang - sisaHutang) / totalHutang) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Hutang" value={formatMoney(totalHutang)} sub={`${debts.length} hutang aktif`} icon={<Wallet size={20} />} color="text-purple-400" bgColor="bg-purple-500/10" />
        <StatCard label="Sisa Hutang" value={formatMoney(sisaHutang)} sub={totalHutang > 0 ? `${((sisaHutang / totalHutang) * 100).toFixed(1)}% dari total` : "0%"} icon={<BarChart3 size={20} />} color="text-green-400" bgColor="bg-green-500/10" />
        <StatCard label="Estimasi Lunas" value={chartData.length > 0 ? `${chartData.length} bulan` : "-"} sub="" icon={<Calendar size={20} />} color="text-blue-400" bgColor="bg-blue-500/10" />

        {/* Progress Card */}
        <div className="luxury-card rounded-3xl p-6 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</p>
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
              <h3 className="font-bold text-[10px] mb-6 text-gray-500 uppercase tracking-widest">Strategi Terbaik Untuk Kamu</h3>

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
                   <h4 className="font-black text-xs text-[#22C55E] uppercase tracking-widest">AI Insight</h4>
                 </div>
                 <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                   {insight || "Memproses data finansialmu..."}
                 </p>
              </div>

              <button className="text-[11px] font-black text-gold uppercase tracking-widest hover:underline mb-6">
                Lihat Rencana Lengkap →
              </button>
            </div>

            <div className="space-y-4 mt-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Extra Payment / bulan</label>
                <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4">
                  <p className="font-black text-white text-lg">{formatMoney(extraPayment)}</p>
                  <Pencil size={16} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>
              <button className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest">
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
             
             <button className="mt-8 w-full bg-blue-600/20 text-blue-400 font-black py-4 rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 relative z-10">
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
                <th className="px-8 py-5">Bunga</th>
                <th className="px-8 py-5">Minimum / bln</th>
                <th className="px-8 py-5">Durasi (Mulai - Selesai)</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {debts.map((d) => (
                <DebtRow
                  key={d.id}
                  name={d.name}
                  total={formatMoney(d.total)}
                  sisa={formatMoney(d.sisa || d.total)}
                  interest={`${d.interest}%`}
                  min={formatMoney(d.min_payment)}
                  tanggalMulai={d.tanggal_mulai}
                  jatuhTempo={d.jatuh_tempo}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DebtRow({ name, total, sisa, interest, min, tanggalMulai, jatuhTempo }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
      <td className="px-8 py-6 font-bold text-white text-sm group-hover:text-[#22C55E]">{name}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">{total}</td>
      <td className="px-8 py-6 font-bold text-white text-sm">{sisa}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">{interest}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">{min}</td>
      <td className="px-8 py-6 text-[13px] text-gray-400">
        <div className="flex flex-col">
          <span>Mulai: {tanggalMulai ? new Date(tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
          <span className="text-gold">Selesai: {jatuhTempo ? new Date(jatuhTempo).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        <span className="inline-block px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-black rounded-md uppercase tracking-widest border border-[#22C55E]/20">Aktif</span>
      </td>
    </tr>
  );
}

function StatCard({ label, value, sub, icon, color, bgColor }) {
  return (
    <div className="luxury-card rounded-3xl p-6 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
        <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black mb-1 text-white tracking-tight">{value}</h3>
      <p className="text-[11px] text-gray-500 font-bold">{sub}</p>
    </div>
  );
}
