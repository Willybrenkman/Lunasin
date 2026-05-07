"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatMoney } = usePrivacy();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/debts");
        const result = await response.json();
        setDebts(result.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fallback dummy data kalau API belum siap
  const debtsList = debts.length > 0 ? debts : [
    { id: 1, name: "Shopee PayLater", total: 1500000, sisa: 300000, interest: 0, min_payment: 300000, jatuhTempo: "-" },
    { id: 2, name: "Kartu Kredit BCA", total: 5000000, sisa: 3200000, interest: 18, min_payment: 500000, jatuhTempo: "10 Jul 2024" },
    { id: 3, name: "Kredit Motor Honda", total: 12000000, sisa: 4600000, interest: 11, min_payment: 600000, jatuhTempo: "15 Agu 2024" },
    { id: 4, name: "Pinjaman Online A", total: 2000000, sisa: 1100000, interest: 24, min_payment: 300000, jatuhTempo: "5 Jul 2024" },
    { id: 5, name: "Kredivo", total: 3000000, sisa: 1000000, interest: 0, min_payment: 250000, jatuhTempo: "-" },
    { id: 6, name: "Pinjaman Teman", total: 1000000, sisa: 1000000, interest: 0, min_payment: 200000, jatuhTempo: "-" },
  ];

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Cari nama hutang..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-gold transition-colors text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <Link href="/dashboard/add" className="flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-black px-6 py-3 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Plus size={18} /> Tambah Hutang
            </button>
          </Link>
        </div>
      </div>

      {/* Tabel Daftar Hutang */}
      <div className="luxury-card rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20">
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-8 py-5">Nama Hutang</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Sisa</th>
                <th className="px-8 py-5">Bunga</th>
                <th className="px-8 py-5">Minimum / bln</th>
                <th className="px-8 py-5">Jatuh Tempo</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {debtsList.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-white/[0.02] transition-all cursor-pointer group"
                >
                  <td className="px-8 py-6">
                    <p className="font-bold text-white text-sm group-hover:text-[#22C55E] transition-colors">{d.name}</p>
                  </td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">
                    {formatMoney(d.total)}
                  </td>
                  <td className="px-8 py-6 font-bold text-white text-sm">
                    {formatMoney(d.sisa || d.total)}
                  </td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">{d.interest}%</td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">
                    {formatMoney(d.min_payment)}
                  </td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">{d.jatuh_tempo || d.jatuhTempo || "-"}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-block px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-black rounded-md uppercase tracking-widest border border-[#22C55E]/20">
                      Aktif
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-gold transition-colors ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
