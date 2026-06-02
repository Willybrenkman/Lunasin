"use client";

import { Download, FileSpreadsheet, FileText, BookOpen, Users } from "lucide-react";

export default function BonusPage() {
  const bonuses = [
    {
      title: "Darurat Plan - 72 Jam Pertama",
      description: "Worksheet Excel untuk menghitung nafas keuangan dan langkah darurat saat Anda baru sadar tidak bisa bayar cicilan.",
      icon: <FileSpreadsheet className="text-green-500" size={32} />,
      format: "Microsoft Excel (.xlsx)",
      link: "https://docs.google.com/spreadsheets/d/14xEeZXZvINntohDH4xzcOWA6rvhzTL5O/edit?usp=sharing"
    },
    {
      title: "Template Surat Negosiasi & UU PDP",
      description: "Kumpulan draft surat resmi untuk minta keringanan ke bank dan surat teguran untuk DC Pinjol Ilegal yang sebar data.",
      icon: <FileText className="text-blue-500" size={32} />,
      format: "Microsoft Word (.docx)",
      link: "https://docs.google.com/spreadsheets/d/1HP3_tlVRWj6ME29E5uJkQQ0GX3-MwwuF/edit?usp=sharing"
    },
    {
      title: "Kalender Motivasi 90 Hari",
      description: "Checklist harian selama 3 bulan untuk mengubah kebiasaan buruk dan membangun kedisiplinan melunasi hutang.",
      icon: <FileSpreadsheet className="text-purple-500" size={32} />,
      format: "PDF & Excel",
      link: "https://docs.google.com/spreadsheets/d/1RysYu60UjS-BbHHqxuHVNumF3pW_4VJy/edit?usp=sharing"
    },
    {
      title: "E-Book: Rahasia Bebas Hutang",
      description: "Panduan lengkap langkah demi langkah keluar dari lubang hutang tanpa harus berhutang lagi.",
      icon: <BookOpen className="text-gold" size={32} />,
      format: "PDF Document",
      link: "https://docs.google.com/document/d/19M23bscT8adDudpjfdJdgmRij0IR09SY/edit?usp=sharing"
    },
    {
      title: "Grup Sharing & Diskusi",
      description: "Bergabung dengan komunitas eksklusif member PRO Lunaskan. Saling berbagi strategi, pengalaman, dan motivasi bersama sesama pejuang bebas hutang.",
      icon: <Users className="text-sky-400" size={32} />,
      format: "Telegram Group",
      link: "https://t.me/lunaskan_circle",
      buttonLabel: "Gabung Grup"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-gradient-to-br from-gold/10 via-black to-[#0A0D12] border border-gold/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full" />
        <h1 className="text-3xl font-black mb-4 text-white">🎁 Bonus Premium</h1>
        <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
          Terima kasih telah bergabung dengan Lunaskan PRO. Sebagai member eksklusif, Anda berhak mengunduh semua materi pendukung di bawah ini secara gratis. Gunakan template ini untuk mempercepat proses kebebasan finansial Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bonuses.map((bonus, idx) => (
          <div key={idx} className="bg-[#0B0F14] border border-white/5 p-6 rounded-2xl hover:border-gold/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {bonus.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {bonus.format}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{bonus.title}</h3>
            <p className="text-sm text-gray-400 mb-6 min-h-[40px]">{bonus.description}</p>
            
            <a
              href={bonus.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white/5 hover:bg-gold hover:text-black text-white transition-all py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              {bonus.buttonLabel ? <Users size={18} /> : <Download size={18} />}
              {bonus.buttonLabel ?? "Unduh Sekarang"}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
