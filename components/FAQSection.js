"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Bagaimana cara daftar?", a: "Klik tombol 'Daftar Gratis' dan hubungi admin via WhatsApp. Admin akan membuatkan akun dan mengirimkan email + password ke kamu dalam waktu singkat." },
  { q: "Apakah data hutang saya aman?", a: "Data kamu disimpan aman di server Supabase yang terlindungi. Hanya kamu yang bisa mengakses akun dan data hutangmu. Kami tidak menjual data ke pihak ketiga." },
  { q: "Apa bedanya strategi Snowball, Avalanche, dan Smart Priority?", a: "Snowball: lunasi hutang terkecil dulu untuk motivasi. Avalanche: lunasi bunga tertinggi dulu untuk hemat bunga. Smart Priority: kombinasi keduanya yang direkomendasikan sistem berdasarkan profilmu." },
  { q: "Apakah PRO bayar bulanan atau sekali bayar?", a: "Sekali bayar, akses selamanya. Tidak ada langganan bulanan yang memberatkan. Bayar Rp 129.000 satu kali dan nikmati semua fitur PRO untuk selamanya." },
  { q: "Bisa dipakai untuk hutang apa saja?", a: "Bisa untuk semua jenis hutang: KTA, kartu kredit, pinjol, cicilan motor/rumah, hutang ke keluarga/teman, PayLater, dan lainnya." },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Ada Pertanyaan?</p>
          <h2 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-black text-sm text-white pr-4">{f.q}</span>
                <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
