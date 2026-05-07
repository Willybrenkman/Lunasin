"use client";

import { User, Bell, Shield, Wallet, ChevronRight, Save } from "lucide-react";

export default function Pengaturan() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-6 bg-[#0F1319] p-8 rounded-[2rem] border border-white/5">
        <div className="w-24 h-24 bg-[#0A0D12] rounded-full overflow-hidden border-4 border-white/5">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andi" alt="Profile" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Andi Setiawan</h2>
          <p className="text-gray-500 mb-4">andi@example.com</p>
          <span className="bg-gold/10 text-gold text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-gold/20">
            Pro Plan User
          </span>
        </div>
        <button className="ml-auto bg-black/20 hover:bg-[#ffffff]/[0.02] text-white font-bold px-6 py-2 rounded-xl border border-white/10 transition-colors">
          Edit Profil
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <SettingsGroup title="Akun & Keamanan">
          <SettingsItem icon={<User size={18} />} label="Informasi Pribadi" sub="Ubah nama dan data dasar" />
          <SettingsItem icon={<Shield size={18} />} label="Kata Sandi & Keamanan" sub="Update password dan 2FA" />
          <SettingsItem icon={<Bell size={18} />} label="Notifikasi" sub="Atur pengingat jatuh tempo" />
        </SettingsGroup>

        <SettingsGroup title="Langganan & Billing">
          <SettingsItem icon={<Wallet size={18} />} label="Metode Pembayaran" sub="Kelola kartu dan e-wallet" />
          <SettingsItem icon={<Shield size={18} />} label="Riwayat Paket" sub="Lihat transaksi langganan" />
          <button className="w-full mt-4 bg-[#D4AF37] text-black font-black py-3 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
            <Save size={18} /> Simpan Perubahan
          </button>
        </SettingsGroup>
      </div>
    </div>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">{title}</h3>
      <div className="bg-[#0F1319] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="divide-y divide-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, sub }) {
  return (
    <div className="flex items-center gap-4 p-6 hover:bg-[#ffffff]/[0.02] cursor-pointer transition-colors group">
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
