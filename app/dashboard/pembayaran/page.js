"use client";

import { CheckCircle2, Clock, ArrowUpRight, Download } from "lucide-react";

export default function Pembayaran() {
  const transactions = [
    { id: "LNS-9921", date: "12 Mei 2024", amount: "Rp 500.000", target: "Shopee PayLater", status: "Berhasil" },
    { id: "LNS-8812", date: "01 Mei 2024", amount: "Rp 99.000", target: "Upgrade Pro Plan", status: "Berhasil" },
    { id: "LNS-7734", date: "15 Apr 2024", amount: "Rp 500.000", target: "Shopee PayLater", status: "Berhasil" },
    { id: "LNS-6621", date: "10 Mar 2024", amount: "Rp 1.200.000", target: "Kredit Motor", status: "Berhasil" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0F1319] text-white p-8 rounded-[2rem] relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-2 font-bold uppercase tracking-widest text-[10px]">Total Terbayar Bulan Ini</p>
            <h3 className="text-4xl font-black mb-6">Rp 1.700.000</h3>
            <button className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all">
              Bayar Sekarang <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gold/5 blur-3xl rounded-full" />
        </div>

        <div className="bg-[#0F1319] border border-white/5 p-8 rounded-[2rem] flex flex-col justify-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Metode Pembayaran Utama</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[10px]">VISA</div>
            <div>
              <p className="font-black text-white text-sm">BCA Virtual Account</p>
              <p className="text-xs text-gray-500 font-bold mt-0.5">**** **** 1234</p>
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
              <th className="px-8 py-5">ID Transaksi</th>
              <th className="px-8 py-5">Tanggal</th>
              <th className="px-8 py-5">Tujuan</th>
              <th className="px-8 py-5">Jumlah</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-[#ffffff]/[0.02] transition-colors group">
                <td className="px-8 py-5 font-bold text-sm text-white/70">{t.id}</td>
                <td className="px-8 py-5 text-sm text-gray-500 font-medium">{t.date}</td>
                <td className="px-8 py-5 font-black text-sm text-white">{t.target}</td>
                <td className="px-8 py-5 font-black text-white text-sm">{t.amount}</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 text-[#22C55E] font-black text-[10px] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-md uppercase tracking-widest">
                    <CheckCircle2 size={12} /> {t.status}
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
