"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, ChevronRight, Loader2, Check, LogOut, Pencil, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Pengaturan() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    is_pro: false,
    pro_activated_at: null,
    created_at: null,
  });
  const [editName, setEditName] = useState("");

  // Voucher info
  const [voucherCode, setVoucherCode] = useState("-");

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Load profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile({
            display_name: profileData.display_name || user.email?.split("@")[0] || "User",
            email: profileData.email || user.email || "",
            is_pro: profileData.is_pro || false,
            pro_activated_at: profileData.pro_activated_at,
            created_at: profileData.created_at,
          });
          setEditName(profileData.display_name || "");
        }

        // Load voucher info
        const { data: voucherData } = await supabase
          .from("vouchers")
          .select("code, used_at")
          .eq("claimed_email", (user.email || "").toLowerCase())
          .limit(1)
          .single();

        if (voucherData) {
          setVoucherCode(voucherData.code);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: editName.trim() })
        .eq("id", user.id);

      if (!error) {
        setProfile(prev => ({ ...prev, display_name: editName.trim() }));
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("debts_cache");
      sessionStorage.removeItem("payments_cache");
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    router.push("/");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      {/* Profile Header */}
      <div className="flex items-center gap-6 bg-[#0F1319] p-8 rounded-[2rem] border border-white/5">
        <div className="w-24 h-24 bg-[#0A0D12] rounded-full overflow-hidden border-4 border-white/5">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`} alt="Profile" loading="lazy" />
        </div>
        <div className="flex-1">
          {editMode ? (
            <div className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-lg font-black text-white outline-none focus:border-gold transition-colors w-full max-w-xs"
                autoFocus
              />
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="p-2 rounded-xl bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button
                onClick={() => { setEditMode(false); setEditName(profile.display_name); }}
                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-black text-white">{profile.display_name}</h2>
          )}
          <p className="text-gray-500 mb-4">{profile.email}</p>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
            profile.is_pro
              ? "bg-gold/10 text-gold border-gold/20"
              : "bg-white/5 text-gray-400 border-white/10"
          }`}>
            {profile.is_pro ? "Pro Plan User" : "Free Account"}
          </span>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="ml-auto bg-black/20 hover:bg-[#ffffff]/[0.02] text-white font-bold px-6 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-2"
          >
            <Pencil size={14} /> Edit Profil
          </button>
        )}
      </div>

      {/* Saved notification */}
      {saved && (
        <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={16} /> Profil berhasil disimpan!
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Informasi Pribadi */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Informasi Akun</h3>
          <div className="bg-[#0F1319] rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              <InfoRow label="Nama Lengkap" value={profile.display_name} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Status" value={profile.is_pro ? "Pro Member" : "Free Account"} highlight={profile.is_pro} />
              <InfoRow label="Bergabung Sejak" value={formatDate(profile.created_at)} />
              <InfoRow label="Login Terakhir" value="Hari ini" />
            </div>
          </div>
        </div>

        {/* Langganan & Billing */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Langganan & Lisensi</h3>
          <div className="bg-[#0F1319] rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              <InfoRow label="Paket Aktif" value={profile.is_pro ? "PRO Lifetime" : "Free"} highlight={profile.is_pro} />
              <InfoRow label="Kode Voucher" value={voucherCode} />
              <InfoRow label="Aktivasi PRO" value={profile.is_pro ? formatDate(profile.pro_activated_at) : "Belum aktif"} />
              <InfoRow label="Masa Berlaku" value={profile.is_pro ? "Selamanya ♾️" : "-"} />
            </div>
          </div>
        </div>
      </div>

      {/* Pengaturan Lainnya */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Pengaturan Lainnya</h3>
        <div className="bg-[#0F1319] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            <SettingsItem
              icon={<Bell size={18} />}
              label="Notifikasi"
              sub="Atur pengingat jatuh tempo"
              onClick={() => router.push("/dashboard/pengingat")}
            />
            <SettingsItem
              icon={<Shield size={18} />}
              label="Customer Service"
              sub="Hubungi admin untuk bantuan"
              onClick={() => window.open("https://wa.me/6289627314790?text=Halo%20Admin%20Lunasin.id,%20saya%20butuh%20bantuan", "_blank")}
            />
            <div
              onClick={handleLogout}
              className="flex items-center gap-4 p-6 hover:bg-red-500/5 cursor-pointer transition-colors group"
            >
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-400">
                <LogOut size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-red-400">Keluar dari Akun</p>
                <p className="text-xs text-gray-500">Logout dari sesi ini</p>
              </div>
              <ChevronRight size={18} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between p-5 px-6">
      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black ${highlight ? "text-gold" : "text-white"}`}>{value}</span>
    </div>
  );
}

function SettingsItem({ icon, label, sub, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-6 hover:bg-[#ffffff]/[0.02] cursor-pointer transition-colors group">
      <div className="p-3 rounded-2xl bg-black/20 group-hover:bg-[#0A0D12] transition-colors text-gray-500 group-hover:text-gold">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}
