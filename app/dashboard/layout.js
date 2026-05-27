"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wallet, LayoutDashboard, CreditCard, BarChart3,
  Bell, Settings, LogOut, HelpCircle, Search, FileText,
  Eye, EyeOff, Gift, BookOpen, X, Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePrivacy } from "@/components/privacy/PrivacyContext";
import ProLock from "@/components/pro/ProLock";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPrivate, togglePrivacy } = usePrivacy();
  const [profile, setProfile] = useState({ display_name: "User", is_pro: false, email: "" });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Semua sub-halaman dashboard hanya untuk user PRO (tidak ada free tier)
  const proOnlyPaths = [
    "/dashboard/debts",
    "/dashboard/add",
    "/dashboard/simulasi",
    "/dashboard/pembayaran",
    "/dashboard/laporan",
    "/dashboard/bonus",
    "/dashboard/ai",
    "/dashboard/pengingat",
    "/dashboard/panduan",
    "/dashboard/pengaturan",
  ];
  const isProPage = proOnlyPaths.some(p => pathname.startsWith(p));
  const isLocked = profileLoaded && !profile.is_pro && isProPage;

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('display_name, is_pro, email')
            .eq('id', user.id)
            .single();
          if (data) {
            setProfile(data);

            if (!data.is_pro) {
              const { data: hasVoucher } = await supabase.rpc(
                'check_email_has_voucher',
                { p_email: user.email }
              );
              if (hasVoucher) {
                await supabase
                  .from('profiles')
                  .update({ is_pro: true, pro_activated_at: new Date().toISOString() })
                  .eq('id', user.id);
                setProfile(prev => ({ ...prev, is_pro: true }));
              }
            }
          }
        }
      } catch {
      } finally {
        setProfileLoaded(true);
      }
    }
    loadProfile();
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Menu items for search
  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Hutang Saya", href: "/dashboard/debts", icon: "💳" },
    { label: "Simulasi", href: "/dashboard/simulasi", icon: "📈" },
    { label: "Pembayaran", href: "/dashboard/pembayaran", icon: "💰" },
    { label: "Laporan", href: "/dashboard/laporan", icon: "📄" },
    { label: "Pengingat", href: "/dashboard/pengingat", icon: "🔔" },
    { label: "Pengaturan", href: "/dashboard/pengaturan", icon: "⚙️" },
    { label: "Asisten Lunaskan", href: "/dashboard/ai", icon: "✨" },
    { label: "Bonus Premium", href: "/dashboard/bonus", icon: "🎁" },
    { label: "Panduan Aplikasi", href: "/dashboard/panduan", icon: "📖" },
  ];

  const filteredMenu = searchQuery
    ? menuItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : menuItems;

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

  const pageTitle = () => {
    const last = pathname.split("/").pop();
    if (last === "dashboard") return "Dashboard";
    if (last === "debts") return "Hutang Saya";
    if (last === "simulasi") return "Simulasi";
    if (last === "pembayaran") return "Pembayaran";
    if (last === "laporan") return "Laporan";
    if (last === "pengingat") return "Pengingat";
    if (last === "pengaturan") return "Pengaturan";
    return last.replace("-", " ");
  };

  return (
    <div className="min-h-screen flex bg-[#06080C] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-[280px] p-6 hidden lg:flex flex-col sticky top-0 h-screen bg-[#0A0D12] border-r border-white/5 shadow-2xl z-30">
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <Wallet className="text-black" size={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Lunaskan.online</span>
        </div>

        <nav className="flex flex-col gap-1.5 px-2">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" active={pathname === "/dashboard"} />
          <SidebarLink icon={<CreditCard size={20} />} label="Hutang Saya" href="/dashboard/debts" active={pathname === "/dashboard/debts"} />
          <SidebarLink icon={<BarChart3 size={20} />} label="Simulasi" href="/dashboard/simulasi" active={pathname === "/dashboard/simulasi"} />
          <SidebarLink icon={<Wallet size={20} />} label="Pembayaran" href="/dashboard/pembayaran" active={pathname === "/dashboard/pembayaran"} />
          <SidebarLink icon={<FileText size={20} />} label="Laporan" href="/dashboard/laporan" active={pathname === "/dashboard/laporan"} />
          <SidebarLink icon={<Bell size={20} />} label="Pengingat" href="/dashboard/pengingat" active={pathname === "/dashboard/pengingat"} />
          <SidebarLink icon={<Settings size={20} />} label="Pengaturan" href="/dashboard/pengaturan" active={pathname === "/dashboard/pengaturan"} />
          
          <div className="my-2 border-t border-white/5"></div>
          <SidebarLink icon={<span className="text-[#D4AF37]">✨</span>} label="Asisten Lunaskan" href="/dashboard/ai" active={pathname === "/dashboard/ai"} />
          <SidebarLink icon={<Gift size={20} />} label="Bonus Premium" href="/dashboard/bonus" active={pathname === "/dashboard/bonus"} />
          <SidebarLink icon={<BookOpen size={20} />} label="Panduan Aplikasi" href="/dashboard/panduan" active={pathname === "/dashboard/panduan"} />
        </nav>

        {/* Status Card */}
        <div className="mt-10 mx-2 p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] text-gold mb-2 font-black uppercase tracking-widest">✨ Status Member</p>
            <p className="text-xs font-bold leading-relaxed text-gray-400">
              {profile.is_pro 
                ? "Saat ini Anda sedang berada di versi PRO. Semua fitur premium terbuka selamanya." 
                : "Anda menggunakan versi Gratis. Upgrade ke PRO untuk membuka semua fitur."}
            </p>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="mt-auto flex flex-col gap-1 border-t border-white/5 pt-6 px-2">
          <SidebarLink icon={<HelpCircle size={20} />} label="Customer Service" href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.online,%20saya%20butuh%20bantuan" target="_blank" />
          <button onClick={handleLogout} className="flex items-center gap-4 p-3 rounded-xl transition-all duration-300 font-bold text-[13px] text-gray-500 hover:text-white hover:bg-white/5">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Header */}
        <header className="backdrop-blur-md bg-[#06080C]/80 border-b border-white/5 py-4 px-6 lg:py-6 lg:px-12 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-[20px] lg:text-[26px] font-black tracking-tight text-white capitalize">
                {pageTitle()}
              </h1>
              <p className="text-[11px] lg:text-[13px] text-gray-500 font-bold mt-0.5 hidden sm:block">Ringkasan kondisi hutangmu saat ini</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button 
                onClick={togglePrivacy}
                className="p-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5"
                title={isPrivate ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
              >
                {isPrivate ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5"
                title="Cari Menu"
              >
                <Search size={22} />
              </button>
              <button
                onClick={() => router.push('/dashboard/pengingat')}
                className="p-2.5 rounded-xl transition-all relative text-gray-400 hover:text-white hover:bg-white/5"
                title="Notifikasi & Pengingat"
              >
                <Bell size={22} />
              </button>
            </div>

            <div className="flex items-center gap-5 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white">Halo, {profile.display_name}</p>
                <p className="text-[10px] text-gold font-black uppercase tracking-widest mt-0.5">{profile.is_pro ? "Pro Member" : "Free Account"}</p>
              </div>
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 p-0.5 hover:scale-105 transition-transform cursor-pointer bg-[#0F1319]">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`} alt="Avatar" loading="lazy" className="w-full h-full object-cover rounded-[0.5rem]" onError={e => { e.currentTarget.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23D4AF37'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='black'>${(profile.display_name?.[0] || 'U').toUpperCase()}</text></svg>`; }} />
              </div>
            </div>
          </div>
        </header>

        {/* Search Overlay */}
        {showSearch && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={() => setShowSearch(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-lg bg-[#0B0F14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search size={20} className="text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-500 font-medium"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredMenu.length > 0 ? filteredMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                      pathname === item.href
                        ? "bg-gold/10 text-gold"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )) : (
                  <p className="text-center text-gray-500 text-sm py-6">Tidak ditemukan</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[280px] bg-[#0A0D12] border-r border-white/5 flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                    <Wallet className="text-black" size={18} />
                  </div>
                  <span className="text-lg font-black text-white">Lunaskan.online</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 flex-1">
                <MobileNavLink icon={<LayoutDashboard size={18} />} label="Dashboard" href="/dashboard" active={pathname === "/dashboard"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<CreditCard size={18} />} label="Hutang Saya" href="/dashboard/debts" active={pathname === "/dashboard/debts"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<BarChart3 size={18} />} label="Simulasi" href="/dashboard/simulasi" active={pathname === "/dashboard/simulasi"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<Wallet size={18} />} label="Pembayaran" href="/dashboard/pembayaran" active={pathname === "/dashboard/pembayaran"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<FileText size={18} />} label="Laporan" href="/dashboard/laporan" active={pathname === "/dashboard/laporan"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<Bell size={18} />} label="Pengingat" href="/dashboard/pengingat" active={pathname === "/dashboard/pengingat"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<Settings size={18} />} label="Pengaturan" href="/dashboard/pengaturan" active={pathname === "/dashboard/pengaturan"} onClick={() => setMobileMenuOpen(false)} />
                <div className="my-2 border-t border-white/5" />
                <MobileNavLink icon={<span className="text-[#D4AF37]">✨</span>} label="Asisten Lunaskan" href="/dashboard/ai" active={pathname === "/dashboard/ai"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<Gift size={18} />} label="Bonus Premium" href="/dashboard/bonus" active={pathname === "/dashboard/bonus"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink icon={<BookOpen size={18} />} label="Panduan Aplikasi" href="/dashboard/panduan" active={pathname === "/dashboard/panduan"} onClick={() => setMobileMenuOpen(false)} />
              </nav>

              <div className="border-t border-white/5 pt-4 flex flex-col gap-1">
                <MobileNavLink icon={<HelpCircle size={18} />} label="Customer Service" href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.online,%20saya%20butuh%20bantuan" onClick={() => setMobileMenuOpen(false)} />
                <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="p-6 lg:p-12 flex-1 max-w-[1600px] mx-auto w-full">
          <ProLock isLocked={isLocked}>
            {!profileLoaded && isProPage ? (
              <div className="h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
              </div>
            ) : children}
          </ProLock>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active, href, target }) {
  return (
    <Link href={href} target={target} className={`
      flex items-center gap-4 p-3 rounded-xl transition-all duration-300 font-bold text-[13px] relative
      ${active
        ? "bg-gold/10 text-gold border-l-4 border-gold pl-3"
        : "text-gray-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"}
    `}>
      <span className={active ? "text-gold" : ""}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ icon, label, href, active, onClick }) {
  return (
    <Link href={href} onClick={onClick} className={`
      flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm
      ${active ? "bg-gold/10 text-gold" : "text-gray-500 hover:text-white hover:bg-white/5"}
    `}>
      <span className={active ? "text-gold" : ""}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
