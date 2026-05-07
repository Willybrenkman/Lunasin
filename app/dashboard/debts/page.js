"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Loader2, Pencil, Trash2, X, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const { formatMoney } = usePrivacy();

  // Edit Modal State
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const cached = sessionStorage.getItem("debts_cache");
    if (cached) {
      setDebts(JSON.parse(cached));
      setLoading(false);
    }
    
    try {
      const response = await fetch("/api/debts");
      const result = await response.json();
      setDebts(result.data || []);
      sessionStorage.setItem("debts_cache", JSON.stringify(result.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      if (!cached) setLoading(false);
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus hutang "${name}"? Data yang dihapus tidak bisa dikembalikan.`)) return;
    
    try {
      const response = await fetch(`/api/debts?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        sessionStorage.removeItem("debts_cache");
        showSuccess("Hutang berhasil dihapus!");
        setDebts(debts.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (debt) => {
    setEditModal({
      isOpen: true,
      data: {
        id: debt.id,
        name: debt.name,
        total: debt.total,
        sisa: debt.sisa,
        interest: debt.interest,
        min_payment: debt.min_payment,
        status: debt.status,
      }
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/debts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.data.id,
          name: editModal.data.name,
          total: Number(editModal.data.total),
          sisa: Number(editModal.data.sisa),
          interest: Number(editModal.data.interest),
          min_payment: Number(editModal.data.min_payment),
          status: editModal.data.status,
        })
      });
      if (response.ok) {
        sessionStorage.removeItem("debts_cache");
        showSuccess("Data hutang berhasil diupdate!");
        setEditModal({ isOpen: false, data: null });
        fetchData(); // Reload data
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(34,197,94,0.15)] backdrop-blur-md">
            <CheckCircle2 size={24} />
            <span className="font-black text-sm tracking-wide">{successMsg}</span>
          </div>
        </div>
      )}

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
                <th className="px-8 py-5">Sisa Hutang</th>
                <th className="px-8 py-5">Jadwal Tagihan</th>
                <th className="px-8 py-5">Bunga</th>
                <th className="px-8 py-5">Minimum / bln</th>
                <th className="px-8 py-5">Durasi (Mulai - Selesai)</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {debts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <p className="text-gray-500 font-bold text-sm mb-2">Belum ada data hutang</p>
                    <p className="text-gray-600 text-xs">Klik tombol "Tambah Hutang" untuk mulai mencatat hutangmu.</p>
                  </td>
                </tr>
              ) : debts.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-white/[0.02] transition-all group"
                >
                  <td className="px-8 py-6">
                    <p className="font-bold text-white text-sm group-hover:text-[#22C55E] transition-colors">{d.name}</p>
                  </td>
                  <td className="px-8 py-6 font-bold text-white text-sm">
                    {formatMoney(d.sisa ?? d.total)}
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400 font-bold whitespace-nowrap">
                    {d.tanggal_tagihan ? `Tgl ${d.tanggal_tagihan}` : "-"}
                  </td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">{d.interest}%</td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">
                    {formatMoney(d.min_payment)}
                  </td>
                  <td className="px-8 py-6 text-[13px] text-gray-400">
                    <div className="flex flex-col">
                      <span>Mulai: {d.tanggal_mulai ? new Date(d.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                      <span className="text-gold">Selesai: {d.jatuh_tempo ? new Date(d.jatuh_tempo).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-block px-3 py-1 text-[9px] font-black rounded-md uppercase tracking-widest border ${
                      d.status === 'paid_off' 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                    }`}>
                      {d.status === 'paid_off' ? "Lunas" : "Aktif"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => openEditModal(d)}
                        className="p-2 bg-white/5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                        title="Edit Hutang"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id, d.name)}
                        className="p-2 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Hapus Hutang"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F1319] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setEditModal({ isOpen: false, data: null })}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black text-white mb-6">Edit Data Hutang</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Nama Hutang</label>
                <input 
                  type="text" 
                  value={editModal.data.name}
                  onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, name: e.target.value}}))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Total Hutang</label>
                  <input 
                    type="number" 
                    value={editModal.data.total}
                    onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, total: e.target.value}}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sisa Hutang</label>
                  <input 
                    type="number" 
                    value={editModal.data.sisa}
                    onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, sisa: e.target.value}}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Bunga / Tahun (%)</label>
                  <input 
                    type="number" 
                    value={editModal.data.interest}
                    onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, interest: e.target.value}}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Cicilan Minimum</label>
                  <input 
                    type="number" 
                    value={editModal.data.min_payment}
                    onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, min_payment: e.target.value}}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tgl Tagihan / Bulanan (1-31)</label>
                <input 
                  type="number" 
                  min="1" max="31"
                  placeholder="Contoh: 25"
                  value={editModal.data.tanggal_tagihan || ""}
                  onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, tanggal_tagihan: e.target.value}}))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status Hutang</label>
                <select 
                  value={editModal.data.status}
                  onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, status: e.target.value}}))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                >
                  <option value="active">Aktif (Belum Lunas)</option>
                  <option value="paid_off">Lunas (Paid Off)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Perubahan</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
