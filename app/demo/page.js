"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet, BarChart3, Crown, Brain,
  ArrowRight, Sparkles, X
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from "recharts";

// Demo dummy data
const DEMO_DEBTS = [
  { name: "Shopee PayLater", total: 1500000, sisa: 300000, interest: 0, min: 300000, tempo: "-" },
  { name: "Kartu Kredit BCA", total: 5000000, sisa: 3200000, interest: 16, min: 500000, tempo: "10 Jul 2024" },
  { name: "Kredit Motor Honda", total: 12000000, sisa: 4600000, interest: 11, min: 600000, tempo: "15 Agu 2024" },
  { name: "Pinjaman Online A", total: 2000000, sisa: 1100000, interest: 24, min: 300000, tempo: "5 Jul 2024" },
  { name: "Kredivo", total: 3000000, sisa: 1000000, interest: 0, min: 250000, tempo: "-" },
  { name: "Pinjaman Teman", total: 1000000, sisa: 1000000, interest: 0, min: 200000, tempo: "-" },
];

const CHART_DATA = Array.from({ length: 16 }, (_, i) => ({
  name: `Bln ${i + 1}`,
  sisa: Math.max(11200000 - i * 750000, 0),
  tanpa: Math.max(11200000 - i * 450000, 0),
}));

function formatRp(n) {
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function DemoPage() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#06080A] text-white font-sans">
      {/* Demo Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black py-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 mx-auto">
            <Sparkles size={18} />
            <span className="font-black text-sm">MODE DEMO — Ini adalah preview dashboard dengan data contoh.</span>
            <Link href="/login">
              <button className="bg-black text-gold px-4 py-1.5 rounded-lg text-xs font-black ml-3 hover:bg-black/80 transition-colors">
                Daftar & Masukkan Data Asli →
              </button>
            </Link>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-black/50 hover:text-black">
            <X size={18} />
          </button>
        </div>
      )}

      <div className={`flex ${showBanner ? 'pt-12' : ''}`}>
        {/* Sidebar */}
        <aside className="w-[280px] bg-[#0B0F14] border-r border-white/5 p-8 flex flex-col min-h-screen shrink-0">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gold rounded-[0.8rem] flex items-center justify-center">
              <Wallet className="text-black" size={22} />
            </div>
            <span className="text-lg font-black tracking-tight">Lunaskan.online</span>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gold/10 text-gold border-l-4 border-gold pl-3 font-bold text-[13px]">
              <BarChart3 size={20} /> Dashboard
            </div>
            {["Hutang Saya", "Simulasi", "Pembayaran", "Laporan", "Pengingat", "Konsultan AI", "Bonus Premium"].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 rounded-xl text-gray-500 font-bold text-[13px] blur-[1.5px] select-none cursor-default">
                <span className="w-4 h-4 rounded bg-white/10 shrink-0" /> {item}
              </div>
            ))}
          </nav>

          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20">
            <p className="text-[10px] text-gold mb-2 font-black uppercase tracking-widest">🔒 Mode Demo</p>
            <p className="text-xs font-bold leading-relaxed text-gray-400">Data ini hanya contoh. Daftar untuk memasukkan data hutang asli Anda.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-12 max-w-[1400px]">
          <div className="mb-8">
            <h1 className="text-[26px] font-black tracking-tight">Dashboard</h1>
            <p className="text-[13px] text-gray-500 font-bold mt-1">Preview — data ini adalah simulasi contoh</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Hutang" value={formatRp(24500000)} sub="6 hutang aktif" color="text-purple-400" bg="bg-purple-500/10" />
            <StatCard label="Sisa Hutang" value={formatRp(11200000)} sub="45.7% dari total" color="text-green-400" bg="bg-green-500/10" />
            <StatCard label="Estimasi Lunas" value="16 bulan" sub="Dengan Smart Priority" color="text-blue-400" bg="bg-blue-500/10" />
            <div className="bg-[#0F1319] border border-white/5 rounded-3xl p-6">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Progress</p>
              <h3 className="text-2xl font-black text-white mb-4">54%</h3>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#22C55E] h-full rounded-full" style={{ width: "54%" }}></div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-[#0F1319] border border-white/5 rounded-[2rem] p-8">
              <h3 className="text-sm font-black mb-6 text-gray-400 uppercase tracking-widest">Grafik Pelunasan (Estimasi)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                  <Tooltip
                    contentStyle={{ background: '#0F1319', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(v) => formatRp(v)}
                  />
                  <Area type="monotone" dataKey="sisa" stroke="#22C55E" fill="url(#demoGrad)" strokeWidth={2} name="Smart Priority" />
                  <Area type="monotone" dataKey="tanpa" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="5 5" name="Tanpa Strategi" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-b from-[#0F1319] to-[#0B0F14] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[10px] mb-6 text-gray-500 uppercase tracking-widest">Strategi Terbaik</h3>
                <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown size={18} className="text-gold" />
                    <h4 className="font-black text-base text-gold">Smart Priority</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    Prioritaskan Pinjaman Online A karena bunganya paling tinggi (24%).
                  </p>
                </div>
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={16} className="text-[#22C55E]" />
                    <h4 className="font-black text-xs text-[#22C55E] uppercase tracking-widest">AI Insight</h4>
                  </div>
                  <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                    Fokus ke hutang bunga tinggi dulu ⚠️. Kamu bisa hemat Rp 2.400.000 bunga!
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Extra Payment / bulan</p>
                  <p className="font-black text-white text-lg">Rp 500.000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Debt Table */}
          <div className="bg-[#0F1319] border border-white/5 rounded-[2rem] overflow-hidden mb-8">
            <div className="p-8 border-b border-white/5">
              <h3 className="font-black text-xl text-white">Daftar Hutang (Contoh)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/20">
                    <th className="px-8 py-5">Nama</th>
                    <th className="px-8 py-5">Total</th>
                    <th className="px-8 py-5">Sisa</th>
                    <th className="px-8 py-5">Bunga</th>
                    <th className="px-8 py-5">Min/bln</th>
                    <th className="px-8 py-5">Jatuh Tempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {DEMO_DEBTS.map((d, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5 font-bold text-white text-sm">{d.name}</td>
                      <td className="px-8 py-5 text-[13px] text-gray-400">{formatRp(d.total)}</td>
                      <td className="px-8 py-5 font-bold text-white text-sm">{formatRp(d.sisa)}</td>
                      <td className="px-8 py-5 text-[13px] text-gray-400">{d.interest}%</td>
                      <td className="px-8 py-5 text-[13px] text-gray-400">{formatRp(d.min)}</td>
                      <td className="px-8 py-5 text-[13px] text-gray-400">{d.tempo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA Bottom */}
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-[2rem] p-12 text-center">
            <h2 className="text-3xl font-black mb-3">Tertarik? Ini baru contohnya!</h2>
            <p className="text-gray-400 font-medium mb-8 max-w-lg mx-auto">
              Masukkan data hutang asli Anda dan dapatkan strategi pelunasan yang dipersonalisasi khusus untuk kondisi keuangan Anda.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.online,%20saya%20tertarik%20membeli%20lisensi%20PRO"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Crown size={18} /> Dapatkan Akses PRO
              </a>
              <Link href="/login">
                <button className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                  Sudah punya kode? <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#0F1319] border border-white/5 rounded-3xl p-6">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{label}</p>
      <h3 className={`text-2xl font-black mb-1 text-white`}>{value}</h3>
      <p className={`text-[11px] font-bold ${color}`}>{sub}</p>
    </div>
  );
}
