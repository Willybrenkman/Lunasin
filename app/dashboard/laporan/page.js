"use client";

import { useState } from "react";
import { Download, TrendingDown, Wallet, Calendar, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const tabs = ["Ringkasan", "Timeline", "Pembayaran", "PDF / Export"];

  const chartData = [
    { name: 'Jan', amount: 4000000 },
    { name: 'Feb', amount: 3500000 },
    { name: 'Mar', amount: 3200000 },
    { name: 'Apr', amount: 2800000 },
    { name: 'Mei', amount: 2500000 },
  ];

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
            <ReportStat label="Penurunan Hutang" value="32.5%" sub="+Rp 1.5jt bln ini" icon={<TrendingDown size={20} />} color="text-green-400" bgColor="bg-green-500/10" />
            <ReportStat label="Bunga Terbayar" value="Rp 850.000" sub="-12% bln lalu" icon={<Calendar size={20} />} color="text-blue-400" bgColor="bg-blue-500/10" />
            <ReportStat label="Rata-rata Cicilan" value="Rp 1.2jt" sub="Stabil" icon={<Wallet size={20} />} color="text-purple-400" bgColor="bg-purple-500/10" />
          </div>

          <div className="luxury-card p-8 rounded-[2rem]">
            <h3 className="font-bold text-sm mb-8 tracking-widest uppercase text-gray-500">Ringkasan Laporan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <SummarySmall label="Estimasi Bebas" value="14 Bulan" />
              <SummarySmall label="Total Bunga" value="Rp 1.750.000" />
              <SummarySmall label="Hemat Bunga" value="Rp 2.300.000" color="text-[#22C55E]" />
              <SummarySmall label="Sisa Tenor" value="Oct 2025" />
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} tickFormatter={(v) => `${v/1000000}jt`} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#0F1319', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#D4AF37' : '#1E293B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - 0.68)} strokeLinecap="round" className="text-gold" style={{filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))'}} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">68</span>
                  <span className="text-gray-500 font-bold text-[10px] mt-1">/ 100</span>
                </div>
              </div>
              <div className="mt-6">
                <span className="bg-gold/10 border border-gold/20 text-gold px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-[0_0_10px_rgba(212,175,55,0.1)]">Waspada</span>
                <p className="text-gray-400 font-medium text-[11px] mt-4 leading-relaxed px-4">Kondisi hutangmu cukup sehat, tapi masih ada risiko.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Faktor Penilaian</p>
              <HealthFactor label="Total Hutang" status="Baik" color="text-[#22C55E]" />
              <HealthFactor label="Rasio Hutang / Penghasilan" status="Cukup" color="text-gold" />
              <HealthFactor label="Beban Pembayaran Bulanan" status="Waspada" color="text-red-400" />
              <HealthFactor label="Diversity Hutang" status="Baik" color="text-[#22C55E]" />
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
