"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Info, Wallet, Percent, CreditCard, Calendar, CalendarCheck } from "lucide-react";
import Link from "next/link";

export default function AddDebt() {
  const [form, setForm] = useState({
    name: "",
    total: "",
    interest: "",
    min_payment: "",
    tanggal_mulai: "",
    jatuh_tempo: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Hitung durasi otomatis
  const getDurasi = () => {
    if (!form.tanggal_mulai || !form.jatuh_tempo) return null;
    const start = new Date(form.tanggal_mulai);
    const end = new Date(form.jatuh_tempo);
    const diffMs = end - start;
    if (diffMs <= 0) return null;
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    if (months > 0 && days > 0) return `${months} bulan ${days} hari`;
    if (months > 0) return `${months} bulan`;
    return `${days} hari`;
  };

  const durasi = getDurasi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total: Number(form.total),
          interest: Number(form.interest),
          min_payment: Number(form.min_payment),
          tanggal_mulai: form.tanggal_mulai || null,
          jatuh_tempo: form.jatuh_tempo || null,
          notes: form.notes || null,
        })
      });
      if (response.ok) router.push("/dashboard/debts");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080C] p-6 md:p-10 flex justify-center text-white">
      <div className="w-full max-w-2xl">
        <header className="mb-10">
          <Link href="/dashboard" className="text-gray-500 hover:text-white flex items-center gap-2 mb-6 transition-colors group font-medium">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-black">Tambah Hutang Baru</h1>
          <p className="text-gray-500">Masukkan detail pinjaman Anda untuk dianalisa sistem.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F1319] rounded-3xl border border-white/5 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <InputField 
                label="Nama Hutang" 
                placeholder="cth: Kartu Kredit BCA" 
                icon={<CreditCard size={18} />}
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
              <InputField 
                label="Total Sisa Hutang" 
                placeholder="cth: 5000000" 
                type="number"
                icon={<Wallet size={18} />}
                value={form.total}
                onChange={e => setForm({...form, total: e.target.value})}
                required
              />
              <InputField 
                label="Bunga per Tahun (%)" 
                placeholder="cth: 12" 
                type="number"
                icon={<Percent size={18} />}
                value={form.interest}
                onChange={e => setForm({...form, interest: e.target.value})}
                required
              />
              <InputField 
                label="Cicilan Minimum / Bulan" 
                placeholder="cth: 500000" 
                type="number"
                icon={<CreditCard size={18} />}
                value={form.min_payment}
                onChange={e => setForm({...form, min_payment: e.target.value})}
                required
              />
              <InputField 
                label="Tanggal Mulai Hutang" 
                placeholder="" 
                type="date"
                icon={<Calendar size={18} />}
                value={form.tanggal_mulai}
                onChange={e => setForm({...form, tanggal_mulai: e.target.value})}
              />
              <InputField 
                label="Target Lunas / Berakhir" 
                placeholder="" 
                type="date"
                icon={<CalendarCheck size={18} />}
                value={form.jatuh_tempo}
                onChange={e => setForm({...form, jatuh_tempo: e.target.value})}
              />
            </div>

            {/* Durasi Preview */}
            {durasi && (
              <div className="bg-gold/10 border border-gold/20 p-4 rounded-2xl flex items-center gap-3">
                <Calendar className="text-gold shrink-0" size={20} />
                <div>
                  <p className="text-xs font-black text-gold uppercase tracking-widest">Durasi Hutang</p>
                  <p className="text-sm font-bold text-white mt-0.5">{durasi}</p>
                </div>
              </div>
            )}

            {/* Catatan */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400">Catatan (opsional)</label>
              <textarea
                placeholder="cth: Cicilan motor, lunas bulan Desember..."
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:border-gold outline-none transition-all placeholder:text-gray-500 text-white font-medium resize-none"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
              <Info className="text-blue-400 shrink-0" size={20} />
              <p className="text-sm text-blue-400 leading-relaxed">
                Gunakan angka nominal murni tanpa titik atau koma (cth: 5000000). Data ini akan tersimpan dengan aman dan terenkripsi.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#D4AF37] text-black font-black py-4 rounded-xl w-full flex items-center justify-center gap-2 disabled:opacity-50 text-lg shadow-lg shadow-gold/20 hover:brightness-110 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Simpan Data Hutang</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ label, icon, ...props }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-gray-400">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors">
          {icon}
        </div>
        <input
          {...props}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all placeholder:text-gray-500 text-white font-medium"
        />
      </div>
    </div>
  );
}
