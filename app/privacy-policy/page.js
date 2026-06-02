import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi — Lunaskan.online",
  description: "Kebijakan privasi dan perlindungan data pengguna Lunaskan.online.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#060A0F] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors mb-8 inline-block">
          ← Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-black mb-2">Kebijakan Privasi</h1>
        <p className="text-gray-500 text-sm mb-10">Terakhir diperbarui: Juni 2026</p>

        <div className="space-y-8 text-gray-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-black text-lg mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p>Lunaskan.online mengumpulkan data berikut saat kamu menggunakan layanan kami:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Alamat email dan nama tampilan (display name)</li>
              <li>Data hutang yang kamu masukkan secara mandiri (nama kreditur, jumlah, bunga, cicilan)</li>
              <li>Riwayat pembayaran yang kamu catat di dashboard</li>
              <li>Preferensi pengingat dan pengaturan akun</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">2. Cara Kami Menggunakan Data</h2>
            <p>Data yang kamu berikan digunakan semata-mata untuk:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Menampilkan dan mengelola dashboard hutangmu</li>
              <li>Menghitung strategi pelunasan (Snowball, Avalanche, Smart Priority)</li>
              <li>Mengirimkan komunikasi terkait akun (aktivasi, bantuan teknis)</li>
            </ul>
            <p className="mt-3">Kami <strong className="text-white">tidak menjual, menyewakan, atau membagikan</strong> data pribadimu kepada pihak ketiga manapun.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">3. Penyimpanan & Keamanan Data</h2>
            <p>Data kamu disimpan di server <strong className="text-white">Supabase</strong> yang dilindungi enkripsi dan Row Level Security (RLS). Hanya kamu yang dapat mengakses data akun milikmu. Kami menggunakan autentikasi berbasis sesi yang aman.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">4. Hak Kamu (UU PDP No. 27/2022)</h2>
            <p>Sesuai Undang-Undang Perlindungan Data Pribadi Indonesia, kamu berhak untuk:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li><strong className="text-white">Mengakses</strong> data pribadimu yang kami simpan</li>
              <li><strong className="text-white">Mengoreksi</strong> data yang tidak akurat</li>
              <li><strong className="text-white">Menghapus</strong> akun dan seluruh data yang terkait</li>
              <li><strong className="text-white">Membatasi</strong> pemrosesan data dalam kondisi tertentu</li>
            </ul>
            <p className="mt-3">Untuk menggunakan hak-hak di atas, hubungi kami via WhatsApp: <a href="https://wa.me/6289627314790" className="text-[#D4AF37] hover:underline">6289627314790</a></p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">5. Cookie & Sesi</h2>
            <p>Lunaskan.online menggunakan cookie sesi untuk menjaga status login kamu. Tidak ada cookie pelacak iklan pihak ketiga yang kami pasang secara langsung di layanan ini.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">6. Perubahan Kebijakan</h2>
            <p>Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan dikomunikasikan melalui email atau notifikasi di dashboard. Dengan terus menggunakan layanan setelah perubahan, kamu dianggap menyetujui kebijakan yang diperbarui.</p>
          </section>

          <section>
            <h2 className="text-white font-black text-lg mb-3">7. Kontak</h2>
            <p>Pertanyaan terkait privasi dapat disampaikan kepada kami melalui:</p>
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
