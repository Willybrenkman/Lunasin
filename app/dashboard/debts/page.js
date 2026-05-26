"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Search, SlidersHorizontal, Loader2, Pencil, Trash2, X, Save, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePrivacy } from "@/components/privacy/PrivacyContext";
import { DEBT_TYPES, getDebtTypeConfig, DEBT_TYPE_COLORS } from "@/lib/debtTypes";

const SORT_OPTIONS = [
  { value: "newest",        label: "Terbaru" },
  { value: "interest_high", label: "Bunga Tertinggi" },
  { value: "sisa_high",     label: "Sisa Terbanyak" },
  { value: "sisa_low",      label: "Sisa Tersedikit" },
  { value: "due_soon",      label: "Jatuh Tempo Terdekat" },
  { value: "progress",      label: "Progress Terbanyak" },
];

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const sortMenuRef = useRef(null);
  const { formatMoney } = usePrivacy();

  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 3500); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); };

  // Edit Modal State
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Close sort menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchData() {
    const cached = sessionStorage.getItem("debts_cache");
    if (cached) {
      setDebts(JSON.parse(cached));
      setLoading(false);
    }
    try {
      const response = await fetch("/api/debts");
      if (!response.ok) throw new Error("API error");
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
        sessionStorage.removeItem("payments_cache");
        showSuccess("Hutang berhasil dihapus!");
        setDebts(debts.filter(d => d.id !== id));
      } else {
        const result = await response.json();
        showError(result.error || "Gagal menghapus hutang. Coba lagi.");
      }
    } catch (error) {
      console.error(error);
      showError("Gagal menghapus hutang. Coba lagi.");
    }
  };

  const openEditModal = (debt) => {
    const typeConfig = getDebtTypeConfig(debt.debt_type || "lainnya");
    // Reverse-convert stored annual effective rate back to the display format of the debt type
    const displayRate = typeConfig.reverseConvert(Number(debt.interest));
    setEditModal({
      isOpen: true,
      data: {
        id: debt.id,
        name: debt.name,
        debt_type: debt.debt_type || "lainnya",
        total: debt.total,
        sisa: debt.sisa,
        interestDisplay: displayRate,
        min_payment: debt.min_payment,
        status: debt.status,
        tanggal_mulai: debt.tanggal_mulai ? debt.tanggal_mulai.slice(0, 10) : "",
        jatuh_tempo: debt.jatuh_tempo ? debt.jatuh_tempo.slice(0, 10) : "",
        tanggal_tagihan: debt.tanggal_tagihan ?? "",
        notes: debt.notes ?? "",
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
          debt_type: editModal.data.debt_type,
          total: Number(editModal.data.total),
          sisa: Number(editModal.data.sisa),
          interest: getDebtTypeConfig(editModal.data.debt_type).convert(Number(editModal.data.interestDisplay)),
          min_payment: Number(editModal.data.min_payment),
          status: editModal.data.status,
          tanggal_mulai: editModal.data.tanggal_mulai || null,
          jatuh_tempo: editModal.data.jatuh_tempo || null,
          tanggal_tagihan: editModal.data.tanggal_tagihan ? Number(editModal.data.tanggal_tagihan) : null,
          notes: editModal.data.notes || null,
        })
      });
      if (response.ok) {
        sessionStorage.removeItem("debts_cache");
        showSuccess("Data hutang berhasil diupdate!");
        setEditModal({ isOpen: false, data: null });
        fetchData();
      } else {
        const result = await response.json();
        showError(result.error || "Gagal menyimpan perubahan. Coba lagi.");
      }
    } catch (error) {
      console.error(error);
      showError("Gagal menyimpan perubahan. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Sort + filter
  const sorted = [...debts].sort((a, b) => {
    switch (sortBy) {
      case "interest_high": return Number(b.interest) - Number(a.interest);
      case "sisa_high":     return Number(b.sisa ?? b.total) - Number(a.sisa ?? a.total);
      case "sisa_low":      return Number(a.sisa ?? a.total) - Number(b.sisa ?? b.total);
      case "due_soon": {
        const ad = a.tanggal_tagihan ? Number(a.tanggal_tagihan) : 99;
        const bd = b.tanggal_tagihan ? Number(b.tanggal_tagihan) : 99;
        return ad - bd;
      }
      case "progress": {
        const ap = Number(a.total) > 0 ? Math.max(0, Math.min(1, (Number(a.total) - Number(a.sisa ?? a.total)) / Number(a.total))) : 0;
        const bp = Number(b.total) > 0 ? Math.max(0, Math.min(1, (Number(b.total) - Number(b.sisa ?? b.total)) / Number(b.total))) : 0;
        return bp - ap;
      }
      default: return 0;
    }
  });

  const filtered = sorted.filter(d =>
    (d.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || "Urutkan";

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(34,197,94,0.15)] backdrop-blur-md">
            <CheckCircle2 size={24} />
            <span className="font-black text-sm tracking-wide">{successMsg}</span>
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(239,68,68,0.15)] backdrop-blur-md">
            <AlertCircle size={24} />
            <span className="font-black text-sm tracking-wide">{errorMsg}</span>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-gold transition-colors text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className={`flex items-center gap-2 border px-5 py-3 rounded-xl text-sm font-bold transition-colors ${
                sortBy !== "newest"
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal size={16} />
              {currentSortLabel}
              <ChevronDown size={14} className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0F1319] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                      sortBy === opt.value
                        ? "bg-gold/10 text-gold"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {opt.value === sortBy && <span className="mr-2">✓</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/dashboard/add" className="flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-black px-6 py-3 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Plus size={18} /> Tambah Hutang
            </button>
          </Link>
        </div>
      </div>

      {/* Debt Table */}
      <div className="luxury-card rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20">
              <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-8 py-5">Nama Hutang</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5">Jadwal Tagihan</th>
                <th className="px-8 py-5">Bunga</th>
                <th className="px-8 py-5">Minimum / Bln</th>
                <th className="px-8 py-5">Durasi</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <p className="text-gray-500 font-bold text-sm mb-2">
                      {searchQuery ? "Tidak ada hutang yang cocok" : "Belum ada data hutang"}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {searchQuery ? "Coba kata kunci lain." : `Klik tombol "Tambah Hutang" untuk mulai mencatat hutangmu.`}
                    </p>
                  </td>
                </tr>
              ) : filtered.map((d) => {
                const typeConfig = getDebtTypeConfig(d.debt_type);
                const typeColor = DEBT_TYPE_COLORS[d.debt_type] || DEBT_TYPE_COLORS.lainnya;
                const total = Number(d.total) || 1;
                const sisa = Number(d.sisa ?? d.total);
                const paid = Math.max(0, total - sisa);
                const paidPct = Math.round((paid / total) * 100);

                return (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-all group">
                    {/* Nama + Tipe */}
                    <td className="px-8 py-5">
                      <p className="font-bold text-white text-sm group-hover:text-[#22C55E] transition-colors mb-1.5">
                        {d.name}
                      </p>
                      <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${typeColor}`}>
                        {typeConfig.label}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-8 py-5">
                      <p className="font-bold text-white text-sm mb-1">{formatMoney(sisa)}</p>
                      <div className="w-28 h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all ${paidPct >= 75 ? "bg-[#22C55E]" : paidPct >= 40 ? "bg-gold" : "bg-blue-400"}`}
                          style={{ width: `${paidPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold">{paidPct}% terbayar</p>
                    </td>

                    {/* Jadwal Tagihan */}
                    <td className="px-8 py-5 text-sm text-gray-400 font-bold whitespace-nowrap">
                      {d.tanggal_tagihan ? `Tgl ${d.tanggal_tagihan}` : "-"}
                    </td>

                    {/* Bunga */}
                    <td className="px-8 py-5">
                      {(() => {
                        const displayRate = typeConfig.reverseConvert(Number(d.interest));
                        const unitMap = { annual: "%/thn", monthly: "%/bln", flat_annual: "%flat/thn", daily: "%/hari" };
                        const unit = unitMap[typeConfig.rateType] || "%/thn";
                        const annualRate = Number(d.interest);
                        return (
                          <span className={`text-sm font-bold ${annualRate >= 24 ? "text-red-400" : annualRate >= 12 ? "text-gold" : "text-gray-300"}`}>
                            {Number.isInteger(displayRate) ? displayRate : displayRate.toFixed(2).replace(/\.?0+$/, "")}{unit}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Min Payment */}
                    <td className="px-8 py-5 text-[13px] text-gray-400">
                      {formatMoney(d.min_payment)}
                    </td>

                    {/* Durasi */}
                    <td className="px-8 py-5 text-[13px] text-gray-400">
                      <div className="flex flex-col gap-0.5">
                        <span>Mulai: {d.tanggal_mulai ? new Date(d.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                        <span className="text-gold">Selesai: {d.jatuh_tempo ? new Date(d.jatuh_tempo).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 text-[9px] font-black rounded-md uppercase tracking-widest border ${
                        d.status === "paid_off"
                          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {d.status === "paid_off" ? "Lunas" : "Aktif"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5">
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F1319] border border-white/10 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditModal({ isOpen: false, data: null })}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-white mb-6">Edit Data Hutang</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Jenis Hutang */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Jenis Hutang</label>
                <div className="relative">
                  <select
                    value={editModal.data.debt_type}
                    onChange={e => {
                      const t = DEBT_TYPES.find(d => d.value === e.target.value);
                      setEditModal(prev => ({...prev, data: {...prev.data, debt_type: e.target.value, interestDisplay: t?.defaultRate?.toString() ?? "0"}}));
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                  >
                    {DEBT_TYPES.map(t => (
                      <option key={t.value} value={t.value} className="bg-[#0F1319]">{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

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

              {(() => {
                const tc = getDebtTypeConfig(editModal.data.debt_type);
                const annualRate = tc.convert(Number(editModal.data.interestDisplay));
                const monthlyInterest = Number(editModal.data.sisa) * (annualRate / 100 / 12);
                const isNonConvergent = Number(editModal.data.min_payment) > 0 && Number(editModal.data.min_payment) <= monthlyInterest;
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{tc.rateLabel}</label>
                        <input
                          type="number"
                          step="any"
                          value={editModal.data.interestDisplay}
                          onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, interestDisplay: e.target.value}}))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                          required
                        />
                        {tc.hint && <p className="text-[11px] text-gray-500 mt-1">{tc.hint}</p>}
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
                    {isNonConvergent && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex gap-2 items-start">
                        <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400">Cicilan minimum lebih kecil dari bunga bulanan ({Math.round(monthlyInterest).toLocaleString("id-ID")}/bln). Hutang ini tidak akan pernah lunas — tambah cicilan minimum.</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tgl Tagihan Bulanan (1–28)</label>
                <input
                  type="number"
                  min="1" max="28"
                  placeholder="Contoh: 25"
                  value={editModal.data.tanggal_tagihan || ""}
                  onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, tanggal_tagihan: e.target.value}}))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                />
                <p className="text-[11px] text-gray-500 mt-1">Maks 28 agar valid di semua bulan termasuk Februari.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editModal.data.tanggal_mulai || ""}
                    onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, tanggal_mulai: e.target.value}}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Target Lunas</label>
                  <input
                    type="date"
                    value={editModal.data.jatuh_tempo || ""}
                    onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, jatuh_tempo: e.target.value}}))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Catatan</label>
                <textarea
                  value={editModal.data.notes || ""}
                  onChange={e => setEditModal(prev => ({...prev, data: {...prev.data, notes: e.target.value}}))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors min-h-[80px]"
                  placeholder="Catatan tambahan (opsional)"
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
