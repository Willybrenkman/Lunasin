"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ArrowUpRight, Download, Loader2, Plus, X, Save, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePrivacy } from "@/components/privacy/PrivacyContext";
import confetti from "canvas-confetti";

export default function Pembayaran() {
  const [payments, setPayments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBulanIni, setTotalBulanIni] = useState(0);
  const { formatMoney } = usePrivacy();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    debt_id: "",
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const cachedPayments = sessionStorage.getItem("payments_cache");
    const cachedDebts = sessionStorage.getItem("debts_cache");
    
    if (cachedPayments) {
      const parsed = JSON.parse(cachedPayments);
      setPayments(parsed);
      calculateTotalBulanIni(parsed);
      if (cachedDebts) {
        setDebts(JSON.parse(cachedDebts));
        setLoading(false);
      }
    } else {
      setLoading(true);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil riwayat pembayaran dari Supabase
      const { data: payData, error: payError } = await supabase
        .from("payments")
        .select("*, debts(name)")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false })
        .limit(20);

      if (!payError && payData) {
        setPayments(payData);
        sessionStorage.setItem("payments_cache", JSON.stringify(payData));
        calculateTotalBulanIni(payData);
      }

      // Ambil daftar hutang aktif untuk dropdown pilihan
      const { data: debtData } = await supabase
        .from("debts")
        .select("id, name, sisa, total")
        .eq("user_id", user.id)
        .eq("status", "active");
        
      if (debtData) {
        setDebts(debtData);
        sessionStorage.setItem("debts_cache", JSON.stringify(debtData));
      }

    } catch (e) {
      console.error(e);
    } finally {
      if (!cachedPayments || !cachedDebts) setLoading(false);
    }
  }

  function calculateTotalBulanIni(payData) {
    const now = new Date();
    const thisMonth = payData.filter(p => {
      const d = new Date(p.payment_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setTotalBulanIni(thisMonth.reduce((s, p) => s + Number(p.amount || 0), 0));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.debt_id || !form.amount) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        const debtPaid = debts.find(d => d.id === form.debt_id);
        const sisaSebelumnya = Number(debtPaid?.sisa ?? debtPaid?.total ?? 0);
        const amountPaid = Number(form.amount);

        sessionStorage.removeItem("debts_cache");
        sessionStorage.removeItem("payments_cache");
        setIsModalOpen(false);
        setForm({ debt_id: "", amount: "", payment_date: new Date().toISOString().split('T')[0], notes: "" });

        if (amountPaid >= sisaSebelumnya) {
          // LUNAS! Fire Confetti!
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#22C55E', '#FFFFFF']
          });
          setSuccessMsg("SELAMAT! SATU HUTANG BERHASIL DITAKLUKKAN! 🏆🎉");
        } else {
          setSuccessMsg("Pembayaran berhasil dicatat & saldo hutang otomatis berkurang! 🚀");
        }
        
        setTimeout(() => setSuccessMsg(""), 5000);
        fetchData(); // Reload data
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading && payments.length === 0) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 relative">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(34,197,94,0.15)] backdrop-blur-md">
            <CheckCircle2 size={24} />
            <span className="font-black text-sm tracking-wide">{successMsg}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0F1319] text-white p-8 rounded-[2rem] relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-2 font-bold uppercase tracking-widest text-[10px]">Total Terbayar Bulan Ini</p>
            <h3 className="text-4xl font-black mb-6">{formatMoney(totalBulanIni)}</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              Bayar Sekarang <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gold/5 blur-3xl rounded-full" />
        </div>

        <div className="bg-[#0F1319] border border-white/5 p-8 rounded-[2rem] flex flex-col justify-center">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Ringkasan Pembayaran</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-medium">Total transaksi</span>
              <span className="font-black text-white text-sm">{payments.length} pembayaran</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-medium">Total dibayar keseluruhan</span>
              <span className="font-black text-white text-sm">{formatMoney(payments.reduce((s, p) => s + Number(p.amount || 0), 0))}</span>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 whitespace-nowrap">Tanggal</th>
                <th className="px-8 py-5 whitespace-nowrap">Tujuan Hutang</th>
                <th className="px-8 py-5 whitespace-nowrap">Jumlah Bayar</th>
                <th className="px-8 py-5 whitespace-nowrap">Catatan</th>
                <th className="px-8 py-5 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <p className="text-gray-500 font-bold text-sm mb-2">Belum ada riwayat pembayaran</p>
                    <p className="text-gray-600 text-xs">Klik "Bayar Sekarang" untuk mencatat pembayaran hutangmu.</p>
                  </td>
                </tr>
              ) : payments.map((t) => (
                <tr key={t.id} className="hover:bg-[#ffffff]/[0.02] transition-colors group">
                  <td className="px-8 py-6 text-sm text-gray-400 font-medium whitespace-nowrap">{formatDate(t.payment_date)}</td>
                  <td className="px-8 py-6 font-black text-sm text-white">{t.debts?.name || "-"}</td>
                  <td className="px-8 py-6 font-black text-[#22C55E] text-sm whitespace-nowrap">{formatMoney(t.amount)}</td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{t.notes || "-"}</td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[#22C55E] font-black text-[10px] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-md uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Berhasil
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Payment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F1319] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gold/10 text-gold">
                <Wallet size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Catat Pembayaran</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Sisa hutang akan otomatis dipotong</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Hutang</label>
                <select 
                  value={form.debt_id}
                  onChange={e => setForm({...form, debt_id: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-gold transition-colors font-bold"
                  required
                >
                  <option value="" disabled>-- Pilih Hutang Yang Dibayar --</option>
                  {debts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Sisa: {formatMoney(d.sisa ?? d.total)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Jumlah Pembayaran</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 500000"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-gold transition-colors font-black text-lg placeholder:text-gray-600 placeholder:font-medium placeholder:text-base"
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tanggal Pembayaran</label>
                <input 
                  type="date" 
                  value={form.payment_date}
                  onChange={e => setForm({...form, payment_date: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-gold transition-colors"
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Catatan (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Pembayaran bulan April"
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-gold transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl mt-2 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Pembayaran</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
