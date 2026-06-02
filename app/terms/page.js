import Link from "next/link";

export const metadata = {
  title: "Syarat & Ketentuan — Lunaskan.online",
  description: "Syarat dan ketentuan penggunaan layanan Lunaskan.online.",
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#060A0F] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors mb-8 inline-block">
          ← Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-black mb-2">Syarat & Ketentuan</h1>
        <p className="text-gray-500 text-sm mb-10">Terakhir diperbarui: Juni 2026</p>

        <div className="space-y-8 text-gray-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-black text-lg mb-3">1. Penerimaan Syarat</h2>
            <p>Dengan mengakses dan menggunakan layanan Lunaskan.online, kamu menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan ini. Jika tidak setuju, mohon hentikan penggunaan layanan.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">2. Deskripsi Layanan</h2>
            <p>Lunaskan.online adalah aplikasi web untuk manajemen dan perencanaan pelunasan hutang pribadi. Layanan ini bersifat <strong className="text-white">alat bantu edukasi keuangan</strong> dan bukan merupakan layanan jasa keuangan, perbankan, atau konsultasi keuangan profesional berlisensi.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">3. Akun & Akses</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Akses PRO diberikan secara manual oleh admin setelah pembayaran dikonfirmasi.</li>
              <li>Kamu bertanggung jawab menjaga kerahasiaan email dan password akun.</li>
              <li>Satu akun hanya untuk satu pengguna. Berbagi akun tidak diperbolehkan.</li>
              <li>Lunaskan.online berhak menonaktifkan akun yang melanggar ketentuan ini.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">4. Pembayaran & Refund</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Harga PRO Lifetime adalah <strong className="text-white">Rp 129.000</strong> — bayar sekali, akses selamanya.</li>
              <li>Pembayaran diproses melalui platform Skalev.</li>
              <li><strong className="text-white">Garansi 7 hari:</strong> jika akses tidak berhasil dikirimkan setelah konfirmasi pembayaran, kami akan menyelesaikan masalah atau mengembalikan dana 100%.</li>
              <li>Refund tidak berlaku untuk alasan di luar kendala teknis pengiriman akses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">5. Disclaimer Keuangan</h2>
            <p>Lunaskan.online <strong className="text-white">bukan lembaga jasa keuangan</strong> dan tidak terdaftar sebagai penasihat keuangan berlisensi. Seluruh informasi, kalkulasi, dan rekomendasi strategi yang tersedia di platform ini bersifat <strong className="text-white">edukasi dan informasi umum semata</strong>. Keputusan keuangan tetap sepenuhnya menjadi tanggung jawab pengguna.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">6. Batasan Tanggung Jawab</h2>
            <p>Lunaskan.online tidak bertanggung jawab atas kerugian finansial yang timbul dari keputusan yang diambil berdasarkan informasi di platform ini. Platform disediakan "sebagaimana adanya" tanpa jaminan keakuratan absolut atas hasil kalkulasi.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">7. Hukum yang Berlaku</h2>
            <p>Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa yang timbul akan diselesaikan secara musyawarah, atau jika diperlukan melalui jalur hukum yang berlaku di Indonesia.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">8. Kontak</h2>
            <p>Pertanyaan terkait syarat & ketentuan:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>WhatsApp: <a href="https://wa.me/6289627314790" className="text-[#D4AF37] hover:underline">6289627314790</a></li>
              <li>Telegram: <a href="https://t.me/lunaskan_circle" className="text-[#D4AF37] hover:underline">t.me/lunaskan_circle</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
