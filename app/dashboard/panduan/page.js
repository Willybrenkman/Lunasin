"use client";

import { AlertTriangle } from "lucide-react";

export default function PanduanPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-4xl">
      <div className="bg-[#0B0F14] border border-white/5 p-8 rounded-3xl relative overflow-hidden">
        <h1 className="text-3xl font-black mb-2 text-white">📖 Panduan Lunaskan.online</h1>
        <p className="text-gray-400 text-sm">Pelajari cara menggunakan sistem ini untuk menghancurkan hutang Anda.</p>
      </div>

      <div className="space-y-6">
        <section className="bg-[#0B0F14] border border-white/5 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-gold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-sm">1</span>
            Masukkan Data Hutang
          </h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>Langkah pertama yang paling penting adalah <strong>Jujur pada diri sendiri</strong>. Masukkan semua data hutang Anda di menu <b>Hutang Saya</b>.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Pilih jenis hutang (Kartu Kredit, PayLater, Pinjol, dll).</li>
              <li>Masukkan Sisa Pokok Hutang dengan tepat.</li>
              <li>Masukkan Suku Bunga dan Cicilan Minimum bulanan.</li>
              <li>Jangan lupa memasukkan Tanggal Jatuh Tempo agar sistem bisa mengingatkan Anda.</li>
            </ul>
            <div className="mt-4 bg-gold/5 border border-gold/20 rounded-xl p-4">
              <p className="text-xs font-bold text-gold mb-2">💡 Tips: Bunga Otomatis Terisi</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Saat kamu memilih jenis hutang, field bunga akan otomatis terisi dengan nilai umum sebagai panduan awal:
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-xs text-gray-400">
                <span>• Kartu Kredit → <b className="text-white">2.5%/bulan</b></span>
                <span>• PayLater → <b className="text-white">2%/bulan</b></span>
                <span>• Pinjol → <b className="text-white">0.4%/hari</b></span>
                <span>• KPR → <b className="text-white">10%/tahun</b></span>
                <span>• KTA → <b className="text-white">12% flat/tahun</b></span>
                <span>• Leasing → <b className="text-white">8% flat/tahun</b></span>
                <span>• Hutang Keluarga → <b className="text-white">0%</b></span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Angka ini bisa kamu ubah sesuai kontrak atau tagihan aslimu. Semakin akurat angka yang dimasukkan, semakin akurat hasil simulasinya.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#0B0F14] border border-white/5 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-gold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-sm">2</span>
            Pilih Strategi Pelunasan
          </h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>Buka menu <b>Dashboard</b> atau <b>Simulasi</b>. Sistem menyediakan tiga strategi pelunasan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                <h4 className="font-bold text-white mb-1">❄️ Snowball (Bola Salju)</h4>
                <p className="text-xs text-gray-400">Melunasi hutang dengan nominal TERKECIL lebih dulu. Cocok untuk Anda yang butuh motivasi cepat melihat hutang lunas satu per satu.</p>
              </div>
              <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                <h4 className="font-bold text-white mb-1">🌋 Avalanche (Longsor)</h4>
                <p className="text-xs text-gray-400">Melunasi hutang dengan bunga TERTINGGI lebih dulu. Secara matematis, ini paling menghemat uang Anda dari bunga.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0B0F14] border border-white/5 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-gold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-sm">3</span>
            Konsultasi dengan AI (Pro)
          </h2>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>Jika Anda bingung harus memprioritaskan yang mana, atau sedang ditagih *Debt Collector*, buka menu <b>Konsultan AI</b>.</p>
            <p className="text-gray-400">AI kami sudah dirancang khusus untuk membaca kondisi finansial Anda secara *real-time* dan memberikan saran hukum serta finansial sesuai aturan yang berlaku di Indonesia.</p>
          </div>
        </section>

        <section className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-3">
            <AlertTriangle size={24} />
            Aturan Emas!
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong>Jangan pernah gali lubang tutup lubang.</strong> Meminjam pinjol baru untuk menutup pinjol lama adalah awal kehancuran. Gunakan Lunaskan.online untuk melakukan restrukturisasi, potong pengeluaran, dan ikuti rencana yang telah dibuatkan oleh sistem.
          </p>
        </section>
      </div>
    </div>
  );
}
