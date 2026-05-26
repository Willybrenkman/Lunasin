import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// In-memory rate limit: maks 30 pesan per user per jam
const rateLimitMap = new Map();
function checkRateLimit(userId) {
  const now = Date.now();
  const recent = (rateLimitMap.get(userId) || []).filter(t => now - t < 60 * 60 * 1000);
  if (recent.length >= 30) return false;
  rateLimitMap.set(userId, [...recent, now]);
  return true;
}

function formatRp(num) {
  return `Rp ${Number(num).toLocaleString("id-ID")}`;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyzeDebts(debts) {
  const totalSisa = debts.reduce((s, d) => s + Number(d.sisa || d.total || 0), 0);
  const totalMin = debts.reduce((s, d) => s + Number(d.min_payment || 0), 0);
  const activeDebts = debts.filter(d => Number(d.sisa || d.total || 0) > 0);
  const paidOff = debts.filter(d => Number(d.sisa || d.total || 0) <= 0);
  const avgInterest = debts.length > 0 ? debts.reduce((s, d) => s + Number(d.interest || 0), 0) / debts.length : 0;

  const highestInterest = activeDebts.length > 0
    ? activeDebts.reduce((max, d) => Number(d.interest || 0) > Number(max.interest || 0) ? d : max, activeDebts[0])
    : debts[0];

  const smallestDebt = activeDebts.length > 0
    ? activeDebts.reduce((min, d) => Number(d.sisa || d.total || 0) < Number(min.sisa || min.total || 0) ? d : min, activeDebts[0])
    : debts[0];

  return { totalSisa, totalMin, highestInterest, smallestDebt, activeDebts, paidOff, avgInterest };
}

function generateResponse(message, debts) {
  const msg = message.toLowerCase().trim();
  const { totalSisa, totalMin, highestInterest, smallestDebt, activeDebts, paidOff, avgInterest } = analyzeDebts(debts);

  // --- Sapaan ---
  if (msg.match(/^(halo|hai|hi|hey|hello|selamat|pagi|siang|sore|malam|apa kabar|assalamu|hallo|p+a+g+i|s+o+r+e)/)) {
    return pick([
      `Halo! Senang bisa ngobrol sama kamu 😊\n\nSaya udah lihat data hutangmu — total ada **${activeDebts.length} hutang aktif** dengan sisa **${formatRp(totalSisa)}**. Ada yang mau kamu tanyain? Bisa soal strategi pelunasan, kapan kira-kira bisa lunas, atau gimana caranya kalau lagi ditagih DC.`,
      `Hai! Asisten Lunasin siap bantu kamu nih 💪\n\nBerdasarkan data yang ada, kamu punya **${activeDebts.length} hutang aktif** dengan total cicilan minimum **${formatRp(totalMin)}/bulan**. Mau mulai dari mana dulu?`,
      `Halo, selamat datang! Saya udah analisis profil hutangmu.\n\nTotal sisa hutangmu sekarang **${formatRp(totalSisa)}** — dan kabar baiknya, dengan rencana yang tepat, ini bisa diselesaikan. Mau diskusi strategi pelunasannya?`,
    ]);
  }

  // --- Siapa kamu / perkenalan ---
  if (msg.includes("siapa kamu") || msg.includes("apa itu lunasin") || msg.includes("kamu itu") || msg.includes("perkenalan") || msg.includes("kamu siapa")) {
    return `Saya **Asisten Lunasin** — asisten finansial digital yang dirancang khusus untuk bantu kamu keluar dari jeratan hutang 💡\n\nSaya bisa bantu kamu:\n• **Analisis hutang** — mana yang paling perlu dilunasi duluan\n• **Estimasi waktu lunas** — berapa lama kalau bayar sekian per bulan\n• **Strategi pelunasan** — Snowball, Avalanche, atau Smart Priority\n• **Hak vs Debt Collector** — kalau kamu lagi ditagih\n• **Negosiasi & restrukturisasi** — cara minta keringanan ke bank\n\nMau mulai dari mana?`;
  }

  // --- Terima kasih ---
  if (msg.match(/^(terima kasih|makasih|thanks|thank you|thx|tq|mantap|oke makasih|ok makasih)/)) {
    return pick([
      `Sama-sama! Senang bisa bantu 😊 Kalau ada pertanyaan lain soal hutang atau keuanganmu, langsung tanya aja ya. Kamu bisa lakuin ini!`,
      `Siap! Jangan ragu balik lagi kalau ada yang mau ditanyain. Inget, setiap langkah kecil itu berarti — tetap semangat! 💪`,
      `Dengan senang hati! Itu yang saya di sini untuk. Kalau muncul pertanyaan baru, saya siap membantu kapan saja.`,
    ]);
  }

  // --- Apa yang bisa dilakukan ---
  if (msg.includes("apa yang bisa") || msg.includes("bisa apa") || msg.includes("menu") || msg.includes("fitur") || msg.includes("bantuan") || msg.includes("help")) {
    return `Berikut yang bisa kamu tanyakan ke saya:\n\n💳 **Soal hutangmu:** strategi terbaik, mana yang dilunasi duluan, estimasi waktu lunas\n📉 **Soal bunga:** analisis bunga, berapa yang bisa dihemat\n📞 **Soal Debt Collector:** hak-hakmu, apa yang boleh dan tidak boleh dilakukan DC\n📋 **Negosiasi:** cara minta restrukturisasi atau keringanan ke bank\n🧠 **Motivasi:** kalau lagi down atau stress soal hutang\n💰 **Keuangan umum:** gaji vs cicilan, tabungan darurat, dll\n\nCoba ketik topik yang kamu mau!`;
  }

  // --- Snowball ---
  if (msg.includes("snowball")) {
    return `**Strategi Snowball** itu konsepnya simpel: lunasi hutang yang **sisanya paling kecil** dulu, lalu "gelindingkan" cicilannya ke hutang berikutnya.\n\nDari data kamu, yang paling kecil sekarang adalah **${smallestDebt.name}** (sisa ${formatRp(smallestDebt.sisa || smallestDebt.total)}).\n\nKenapa Snowball efektif? Karena setiap hutang yang lunas itu kasih dopamin — kamu merasa maju, termotivasi, dan lebih konsisten. Secara matematis mungkin bukan yang paling hemat, tapi secara psikologis ini salah satu strategi yang paling berhasil dijalankan orang. 💪\n\nMau saya bantu hitung berapa lama kalau pakai Snowball?`;
  }

  // --- Avalanche ---
  if (msg.includes("avalanche") || msg.includes("longsor")) {
    return `**Strategi Avalanche** itu pilihan paling efisien secara matematis — kamu fokus ke hutang dengan **bunga tertinggi** dulu, supaya total bunga yang kamu bayar sesedikit mungkin.\n\nDari data kamu, hutang dengan bunga tertinggi adalah **${highestInterest.name}** di **${highestInterest.interest}% per tahun**. Ini yang "paling mahal" kalau dibiarkan lama.\n\nKelemahannya: butuh waktu lebih lama sebelum ada hutang yang lunas, jadi butuh kedisiplinan lebih. Tapi kalau kamu tipe yang bisa konsisten, ini akan menghemat uang paling banyak dalam jangka panjang.\n\nTotal sisa hutangmu sekarang: ${formatRp(totalSisa)}.`;
  }

  // --- Strategi terbaik / cara / metode ---
  if (msg.includes("strategi") || msg.includes("cara") || msg.includes("metode") || msg.includes("terbaik") || msg.includes("rekomendasi")) {
    return `Berdasarkan profil hutangmu, saya rekomendasikan **Smart Priority** — ini gabungan terbaik antara Snowball dan Avalanche.\n\nCaranya:\n1. Mulai dengan lunasi **${smallestDebt.name}** (sisa ${formatRp(smallestDebt.sisa || smallestDebt.total)}) — cepat selesai, kasih motivasi\n2. Setelah itu, fokuskan semua energi ke **${highestInterest.name}** (bunga ${highestInterest.interest}%) — yang paling mahal kalau dibiarkan\n\nTotal cicilan minimummu sekarang **${formatRp(totalMin)}/bulan**. Kalau kamu bisa tambah Rp 200-500 ribu/bulan, perbedaannya bisa sangat signifikan.\n\nMau saya jelaskan lebih detail perbandingan Snowball vs Avalanche?`;
  }

  // --- Kartu kredit ---
  if (msg.includes("kartu kredit") || msg.includes("cc ") || msg.includes(" cc") || msg.match(/\bkk\b/)) {
    const kkDebts = debts.filter(d => d.name.toLowerCase().includes("kartu") || d.name.toLowerCase().includes("kredit") || d.name.toLowerCase().includes(" cc"));
    if (kkDebts.length > 0) {
      return `Kartu kredit itu salah satu hutang yang paling "berbahaya" kalau cuma bayar minimum — bunga compounding-nya bisa bikin saldo hampir nggak turun!\n\nDari datamu, kartu kreditmu: **${kkDebts.map(d => `${d.name} (bunga ${d.interest}%)`).join(", ")}**.\n\nSaran saya:\n• Usahakan bayar **lebih dari minimum** setiap bulan — idealnya 2-3x lipat\n• Jangan tambah transaksi baru kalau belum lunas\n• Kalau bunganya di atas 24% per tahun, ini prioritas tinggi untuk dilunasi\n\nMau saya hitung berapa lama lunas kalau bayar sekian per bulan?`;
    }
    return `Kartu kredit itu jebakan paling umum — kalau cuma bayar minimum tiap bulan, hutangnya hampir nggak pernah turun karena bunganya tinggi (biasanya 24-27% per tahun).\n\nTips: Usahakan selalu bayar lebih dari minimum, dan hindari gesek untuk keperluan yang nggak mendesak selama masih ada saldo terutang. Kalau ada kartu kredit di daftar hutangmu, itu harus masuk prioritas!`;
  }

  // --- Pinjol ---
  if (msg.includes("pinjol") || msg.includes("pinjaman online") || msg.includes("fintech")) {
    const pinjolDebts = debts.filter(d =>
      d.name.toLowerCase().includes("pinjol") ||
      d.name.toLowerCase().includes("pinjaman online") ||
      d.name.toLowerCase().includes("kredivo") ||
      d.name.toLowerCase().includes("akulaku") ||
      d.name.toLowerCase().includes("indodana")
    );
    if (pinjolDebts.length > 0) {
      return `Oke, saya lihat kamu punya pinjol: **${pinjolDebts.map(d => d.name).join(", ")}**.\n\nBeberapa hal penting yang perlu kamu tahu:\n\n⚡ Pinjol itu bunganya kompetitif tapi dendanya brutal kalau telat — jadi ini prioritas pertama untuk dilunasi.\n\n🚫 Jangan pernah pinjam pinjol baru untuk bayar pinjol lama — itu jebakan spiral yang susah keluar.\n\nKalau kamu ditagih dengan cara yang nggak manusiawi (ancaman, sebar data, hubungi orang lain), kamu bisa langsung lapor ke **OJK: 157**. Itu hak kamu dan dilindungi hukum.`;
    }
    return `Pinjol harus jadi prioritas pelunasan nomor satu — bunganya biasanya paling tinggi dan dendanya bisa sangat besar.\n\n🚫 Satu rule paling penting: **jangan pernah pinjam pinjol baru untuk bayar yang lama**. Itu spiral yang hampir nggak ada ujungnya.\n\nKalau kamu merasa tertekan oleh DC atau pinjol ilegal, laporkan ke OJK di **157** — kamu dilindungi hukum.`;
  }

  // --- PayLater ---
  if (msg.includes("paylater") || msg.includes("pay later") || msg.includes("shopee") || msg.includes("kredivo") || msg.includes("gopay later") || msg.includes("spaylater")) {
    return `PayLater itu kelihatannya "kecil-kecil" tapi kalau telat bayar, dendanya bisa mencengangkan — ada yang 1-5% per hari!\n\nSaran praktis:\n• Selalu bayar **sebelum jatuh tempo** — taruh pengingat di HP kamu\n• Jangan pakai PayLater untuk belanja impulsif atau yang bisa ditunda\n• Cek tagihan PayLater rutin — kadang ada biaya tersembunyi\n\nKalau ada PayLater di daftar hutangmu, biasanya ini yang paling cepat dilunasi karena saldonya kecil. Lunasin dulu, terus jangan dipakai lagi sebelum hutang utama selesai 😊`;
  }

  // --- Tidak bisa bayar / telat / nunggak ---
  if (msg.includes("tidak bisa bayar") || msg.includes("nggak bisa bayar") || msg.includes("gabisa bayar") || msg.includes("telat bayar") || msg.includes("nunggak") || msg.includes("gagal bayar")) {
    return `Pertama-tama, tarik napas dulu — ini situasi yang banyak orang alami dan ada jalan keluarnya.\n\nKalau kamu lagi susah bayar, langkah paling bijak adalah **hubungi pihak bank/lembaga kredit lebih dulu** sebelum telat. Jangan tunggu ditagih.\n\nApa yang bisa kamu minta:\n• **Restrukturisasi** — cicilan lebih kecil, tenor lebih panjang\n• **Penundaan bayar** (grace period) — beberapa bank kasih ini\n• **Penghapusan denda** — kalau kamu komunikasi duluan sebelum telat\n\nBank jauh lebih suka kamu bayar lambat daripada nggak sama sekali. Gunakan template Surat Negosiasi di menu **Bonus Premium** — itu bisa bantu komunikasi yang lebih formal. 📋`;
  }

  // --- Restrukturisasi / negosiasi / keringanan ---
  if (msg.includes("restrukturisasi") || msg.includes("negosiasi") || msg.includes("keringanan") || msg.includes("cicilan lebih kecil") || msg.includes("minta keringanan")) {
    return `Restrukturisasi hutang itu hak kamu sebagai nasabah, dan bank sering mau negosiasi daripada kehilangan pembayaran sama sekali.\n\nCara efektif melakukannya:\n\n**1. Hubungi CS bank/lembaga kredit** — telepon atau datang langsung, jangan via DC.\n**2. Jelaskan situasimu dengan jujur** — kehilangan pekerjaan, sakit, dll. Sertakan bukti kalau ada.\n**3. Usulkan angka konkret** — "Saya bisa bayar Rp X/bulan" lebih meyakinkan dari "saya kesulitan bayar".\n\nYang bisa dinegosiasikan: penurunan bunga, perpanjangan tenor, penghapusan denda, atau bayar pokok saja dulu.\n\nUntuk surat formal, gunakan template di menu **Bonus Premium** ya — sudah saya siapkan templat-nya. 📋`;
  }

  // --- Ancaman sebar foto / data / kontak ---
  if (msg.includes("sebar foto") || msg.includes("sebar data") || msg.includes("sebar kontak") || msg.includes("sebar nomor") || msg.includes("ancam sebar") || msg.includes("foto saya") || msg.includes("foto kamu") || msg.includes("upload foto") || msg.includes("viral")) {
    return `Ini pelanggaran serius dan kamu punya perlindungan hukum yang jelas! 🛡️\n\n**Ancaman sebar foto/data pribadi adalah TINDAK PIDANA** — diatur dalam:\n• **UU PDP (Perlindungan Data Pribadi)** — Pasal 67, ancaman penjara hingga 6 tahun\n• **UU ITE Pasal 27** — penyebaran data/konten tanpa izin\n\n**Yang harus kamu lakukan SEKARANG:**\n1. 📸 **Screenshot semua percakapan** — termasuk nomor HP pengirim\n2. 🚫 **Jangan transfer uang apapun** — ini taktik intimidasi, bukan hak mereka\n3. 📞 **Lapor ke OJK: 157** atau whatsapp ke 081-157-157-157\n4. 🏛️ **Lapor ke Polisi** — bawa bukti screenshot, ini pidana\n5. 📋 **Gunakan template Surat Teguran UU PDP** di menu **Bonus Premium**\n\nJangan takut dan jangan terburu-buru transfer uang. Mereka mengancam karena panik — kamu punya hak hukum di atas mereka. 💪`;
  }

  // --- Ancaman hubungi keluarga / kantor / atasan ---
  if (msg.includes("keluarga") || msg.includes("kantor") || msg.includes("atasan") || msg.includes("bos") || msg.includes("teman") || msg.includes("tetangga") || msg.includes("hubungi orang") || msg.includes("kontak orang lain")) {
    return `Ini juga pelanggaran yang sangat jelas — DC **tidak punya hak** menghubungi siapapun selain kamu! 🛡️\n\nOJK sudah mempertegas aturan ini:\n• DC **hanya boleh** menghubungi nomor yang kamu daftarkan saat pengajuan\n• Menghubungi keluarga, teman, atau rekan kerja = **pelanggaran POJK No. 35/2018**\n• Menekan orang lain agar kamu bayar = bisa masuk ranah **pemerasan (Pasal 368 KUHP)**\n\n**Langkah kamu:**\n1. Screenshot semua percakapan DC dengan kamu dan orang-orang itu\n2. Minta keluarga/teman juga screenshot kalau dihubungi langsung\n3. Laporkan ke **OJK: 157** dengan bukti tersebut\n4. Kalau mereka masih lanjut, lapor ke **Polres** terdekat\n\nKamu tidak perlu meminta maaf atas situasi ini — kamu sedang dibully, dan ada hukum yang lindungi kamu. 🙏`;
  }

  // --- Ancaman datang ke rumah / kekerasan fisik ---
  if (msg.includes("datang ke rumah") || msg.includes("ke rumah") || msg.includes("rumahku") || msg.includes("rumah saya") || msg.includes("ancam datang") || msg.includes("kekerasan") || msg.includes("pukul") || msg.includes("hajar") || msg.includes("aniaya") || msg.includes("fisik")) {
    return `Ini sudah masuk ranah ancaman kekerasan — dan ini darurat! ⚠️\n\n**Jika kamu merasa terancam keselamatannya:**\n• Hubungi **Polisi 110** segera kalau ada yang mengancam datang\n• Jangan buka pintu untuk tamu tak dikenal yang mengaku DC\n• Minta bantuan tetangga atau saudara jika perlu\n\n**Fakta hukum:** DC yang mengancam kekerasan fisik bisa dijerat:\n• **Pasal 368 KUHP** — Pemerasan, ancaman penjara 9 tahun\n• **Pasal 335 KUHP** — Perbuatan tidak menyenangkan\n• **UU No. 4/2023** — POJK tentang layanan keuangan\n\n**Langkah segera:**\n1. Rekam atau screenshot semua ancaman\n2. Lapor ke **Polisi 110** kalau merasa tidak aman\n3. Lapor ke **OJK: 157** dengan bukti pesan ancaman\n4. Jangan bayar apapun karena ketakutan — itu tujuan mereka\n\nKeselamatanmu lebih penting dari hutang apapun. Jika dalam bahaya nyata, prioritaskan keamanan dulu. 🙏`;
  }

  // --- Teror tengah malam / luar jam ---
  if (msg.includes("tengah malam") || msg.includes("malam hari") || msg.includes("subuh") || msg.includes("dini hari") || msg.includes("jam 12") || msg.includes("jam 1") || msg.includes("jam 2") || msg.includes("jam 3") || msg.includes("luar jam") || msg.includes("terus-terusan") || msg.includes("spam")) {
    return `Itu jelas pelanggaran aturan OJK! 😤\n\n**Aturan jam penagihan:**\n• Hari Kerja (Senin–Jumat): **jam 08.00–20.00** saja\n• Hari Sabtu: **jam 08.00–15.00** saja\n• **Minggu & hari libur nasional: DILARANG SAMA SEKALI**\n\nMenagih di luar jam itu = pelanggaran POJK yang bisa langsung dilaporkan.\n\n**Yang kamu bisa lakukan:**\n1. Catat atau screenshot timestamp pesan/telepon mereka\n2. Blokir nomor tersebut — kamu berhak melakukan ini\n3. Laporkan ke **OJK: 157** dengan bukti timestamp\n4. Jika terus spam, bisa lapor ke **Kominfo: 159** untuk penyalahgunaan telekomunikasi\n\nKamu berhak dapat ketenangan dan tidur yang cukup — jangan biarkan mereka rampas itu. 💙`;
  }

  // --- DC / Debt Collector (umum) ---
  if (msg.includes("dc ") || msg.includes(" dc") || msg.match(/\bdc\b/) || msg.includes("debt collector") || msg.includes("ditagih") || msg.includes("teror") || msg.includes("intimidasi") || msg.includes("ancam")) {
    return pick([
      `Saya dengar kamu — ditagih DC itu stressful banget. Tapi kamu punya hak yang dilindungi hukum 💪\n\n**Yang TIDAK boleh dilakukan DC:**\n• Menagih di luar jam 08.00–20.00 (Senin–Jumat) atau 08.00–15.00 (Sabtu)\n• Mengancam, memaki, atau merendahkan kamu\n• Menghubungi keluarga, teman, atau atasan\n• Menyebarkan data pribadi atau foto kamu\n• Mengaku sebagai aparat hukum\n\n**Langkah yang bisa kamu ambil sekarang:**\n1. Screenshot semua pesan/rekaman yang mengancam\n2. Laporkan ke **OJK di 157** atau whatsapp **081-157-157-157**\n3. Gunakan template Surat Teguran UU PDP di menu **Bonus Premium**\n\nIngat — kamu punya hak, dan hukum ada di pihakmu. Jangan biarkan mereka intimidasi kamu.`,
      `DC yang kasar itu nggak boleh dibiarkan — dan kamu nggak harus diam. 🛡️\n\nHak kamu sebagai nasabah:\n• **Privasi terlindungi** — mereka tidak boleh sebar data atau kontakmu\n• **Waktu istirahat dihormati** — no penagihan di luar jam kerja\n• **Martabat dijaga** — ancaman & makian adalah tindakan ilegal\n\nKalau mereka melanggar salah satunya:\n1. Dokumentasikan (screenshot, rekam kalau bisa)\n2. Laporkan ke **OJK: 157**\n3. Kalau lebih serius, ini masuk ranah pidana — lapor **Polisi 110**\n\nSaya bisa bantu lebih spesifik — ceritakan jenis ancaman yang kamu terima.`,
    ]);
  }

  // --- Bunga ---
  if (msg.includes("bunga") || msg.includes("interest rate")) {
    return `Oke, saya analisis bunga hutang-hutangmu:\n\n${debts.map(d => `• **${d.name}**: ${d.interest}% per tahun`).join("\n")}\n\nRata-rata bungamu: **${avgInterest.toFixed(1)}%** per tahun.\n\n🔴 Yang paling "mahal" adalah **${highestInterest.name}** di ${highestInterest.interest}% — ini yang harus diprioritaskan kalau kamu mau hemat bunga secara keseluruhan.\n\nSebagai referensi, bunga di atas 20% per tahun itu termasuk tinggi dan perlu diprioritaskan. Di bawah 10% masih relatif manageable.`;
  }

  // --- Estimasi lunas / kapan lunas ---
  if (msg.includes("lunas") || msg.includes("kapan") || msg.includes("estimasi") || msg.includes("berapa lama") || msg.includes("selesai")) {
    if (totalMin === 0) {
      return `Untuk estimasi waktu lunas, saya butuh data cicilan minimum di tiap hutangmu. Pastikan kamu sudah mengisi kolom "Cicilan Minimum" di menu Hutang Saya ya.`;
    }
    const bulanBase = Math.ceil(totalSisa / totalMin);
    const bulanExtra500 = Math.ceil(totalSisa / (totalMin + 500000));
    const bulanExtra1jt = Math.ceil(totalSisa / (totalMin + 1000000));
    return `Oke, saya hitung estimasinya berdasarkan data hutangmu:\n\n📅 **Dengan cicilan minimum saja (${formatRp(totalMin)}/bln):**\n→ Sekitar **${bulanBase} bulan** (${Math.ceil(bulanBase / 12)} tahun ${bulanBase % 12} bulan)\n\n💪 **Kalau tambah Rp 500.000/bln:**\n→ Bisa jadi sekitar **${bulanExtra500} bulan** (hemat ${bulanBase - bulanExtra500} bulan!)\n\n🚀 **Kalau tambah Rp 1.000.000/bln:**\n→ Bisa sekitar **${bulanExtra1jt} bulan** (hemat ${bulanBase - bulanExtra1jt} bulan!)\n\nSetiap tambahan sekecil apapun itu berpengaruh nyata. Mau coba hitung dengan angka tertentu?`;
  }

  // --- Gaji / penghasilan ---
  if (msg.includes("gaji") || msg.includes("penghasilan") || msg.includes("income") || msg.includes("dti") || msg.includes("rasio")) {
    const gajiAman = Math.round(totalMin / 0.3);
    return `Ini pertanyaan penting! Ada patokan yang namanya **DTI (Debt-to-Income Ratio)**.\n\nRule of thumb-nya: total cicilan hutangmu idealnya **maksimal 30%** dari gaji bersih.\n\nDari datamu, total cicilan minimummu **${formatRp(totalMin)}/bulan** — artinya:\n\n✅ Gaji minimal yang aman: **${formatRp(gajiAman)}/bulan**\n\nKalau gajimu di bawah angka itu, ada dua opsi: cari income tambahan, atau lakukan restrukturisasi untuk kecilkan cicilan.\n\nMau diskusi cara-cara ningkatin cash flow atau renegotiasi hutang?`;
  }

  // --- Tabungan darurat / dana darurat ---
  if (msg.includes("tabungan darurat") || msg.includes("dana darurat") || msg.includes("emergency fund")) {
    return `Dana darurat itu seperti "jaring pengaman" finansialmu — dan ini penting bahkan saat kamu masih punya hutang.\n\nIdealnya, punya dana darurat **3-6x pengeluaran bulanan** sebelum agresif bayar hutang.\n\nKenapa? Karena tanpa dana darurat, satu musibah (sakit, kena PHK, kendaraan rusak) bisa bikin kamu terpaksa hutang lagi — dan ngereset semua progress yang udah kamu capai.\n\n**Saran praktis:**\n• Prioritas pertama: kumpulkan dulu minimal 1x pengeluaran bulanan sebagai buffer\n• Setelah itu, alokasikan 70% extra cash ke bayar hutang, 30% ke dana darurat\n• Simpan di rekening terpisah agar tidak "tergoda" dipakai`;
  }

  // --- Investasi ---
  if (msg.includes("investasi") || msg.includes("nabung") || msg.includes("saham") || msg.includes("reksa dana") || msg.includes("emas")) {
    return `Pertanyaan bagus! Soal investasi saat masih punya hutang, jawabannya tergantung bunga hutangmu.\n\n**Aturan sederhananya:**\n• Kalau bunga hutangmu lebih tinggi dari return investasi → **lunasi hutang dulu**\n• Bunga KPR 8% vs return reksa dana 10% → mungkin bisa jalan bersamaan\n• Bunga pinjol 30%+ → mustahil investasi apapun mengalahkan itu, lunasi dulu!\n\nRata-rata bungamu sekarang **${avgInterest.toFixed(1)}%**. Kalau di atas 12%, fokus lunasi hutang dulu baru investasi agresif.\n\nSatu pengecualian: tetap nabung dana darurat kecil (Rp 1-3 juta) meski dalam mode bayar hutang. Ini bukan investasi, tapi safety net.`;
  }

  // --- Motivasi / stress ---
  if (msg.includes("motivasi") || msg.includes("semangat") || msg.includes("putus asa") || msg.includes("stress") || msg.includes("stres") || msg.includes("depresi") || msg.includes("nyerah") || msg.includes("capek") || msg.includes("lelah") || msg.includes("down")) {
    return pick([
      `Kamu udah ambil langkah yang banyak orang nggak berani ambil — nghadap masalah finansialmu secara langsung, bukan lari dari itu. Itu bukan hal kecil 💙\n\nHutang **${formatRp(totalSisa)}** itu kelihatannya besar, tapi kamu nggak harus lunasi semuanya sekarang. Kamu cuma perlu melakukan satu langkah: bayar cicilan bulan ini. Terus ulangi.\n\nProgram ini bukan marathon satu hari — tapi kamu nggak lari sendirian. Saya di sini kalau kamu mau curhat atau butuh saran. 💪`,
      `Pertama, apresiasi diri kamu dulu. Kamu udah jujur sama kondisimu dan mau nyari solusi — itu lebih dari yang dilakukan kebanyakan orang.\n\nIngat: hutang sebesar apapun, selama kamu masih punya penghasilan dan konsisten, pasti ada titik lunas-nya. Belum pernah ada hutang yang nggak bisa selesai kalau dicicil dengan benar.\n\nKalau kamu mau cerita lebih soal situasinya, saya siap dengerin. Kadang sekedar nulis juga bisa ngeringanin beban pikiran. 🌟`,
    ]);
  }

  // --- Cicilan / tenor ---
  if (msg.includes("cicilan") || msg.includes("tenor") || msg.includes("angsuran") || msg.includes("installment")) {
    return `Untuk melihat cicilan semua hutangmu:\n\n${debts.map(d => `• **${d.name}**: cicilan minimum ${formatRp(d.min_payment || 0)}/bulan (sisa ${formatRp(d.sisa || d.total || 0)})`).join("\n")}\n\n**Total cicilan minimum:** ${formatRp(totalMin)}/bulan\n\nKalau mau tau mana yang harus ditambah cicilannya duluan — jawabannya hutang dengan bunga tertinggi: **${highestInterest.name}** (${highestInterest.interest}%).`;
  }

  // --- Hutang lunas / progress ---
  if (msg.includes("progres") || msg.includes("progress") || msg.includes("sudah lunas") || msg.includes("udah lunas") || msg.includes("berhasil")) {
    if (paidOff.length > 0) {
      return `Kamu udah lunasin **${paidOff.length} hutang** — itu pencapaian nyata yang harus dirayakan! 🎉\n\nHutang yang sudah lunas: ${paidOff.map(d => `**${d.name}**`).join(", ")}.\n\nSekarang kamu masih punya **${activeDebts.length} hutang aktif** dengan sisa total **${formatRp(totalSisa)}**. Terus pertahankan momentum ini — setiap hutang yang lunas bikin yang berikutnya lebih mudah!`;
    }
    return `Kamu baru mulai perjalanannya — dan itu hal yang bagus! Belum ada hutang yang lunas, tapi kamu udah punya rencana dan data yang jelas. Itu langkah pertama yang paling penting.\n\nTotal sisa sekarang: **${formatRp(totalSisa)}**. Mau saya bantu buat rencana step-by-step untuk mulai melunasinya?`;
  }

  // --- Krisis / pikiran menyakiti diri ---
  if (
    msg.includes("ingin mati") || msg.includes("mau mati") || msg.includes("bunuh diri") ||
    msg.includes("tidak mau hidup") || msg.includes("nggak mau hidup") || msg.includes("akhiri hidup") ||
    msg.includes("cape hidup") || msg.includes("capek hidup") || msg.includes("nggak sanggup lagi") ||
    msg.includes("tidak sanggup lagi") || msg.includes("hidup gak ada artinya") || msg.includes("nyawa")
  ) {
    return `Saya sangat peduli dengan apa yang kamu rasakan sekarang, dan saya minta kamu untuk berhenti sejenak. 💙\n\nHutang sebesar apapun **bisa diselesaikan** — tapi kamu tidak bisa digantikan. Tidak oleh siapapun.\n\nTolong hubungi salah satu dari ini sekarang:\n• 📞 **Into The Light Indonesia: 119 ext 8** — konseling krisis 24 jam\n• 📞 **Yayasan Pulih: (021) 788-42580**\n• 💬 **Chat: sejiwa.org** — bisa anonim\n\nKamu tidak harus menanggung semua ini sendirian. Orang-orang di sana siap mendengar, tanpa menghakimi.\n\nKalau kamu mau cerita dulu di sini, saya juga siap mendengar. 🙏`;
  }

  // --- Judi online / judol ---
  if (msg.includes("judi") || msg.includes("judol") || msg.includes("slot") || msg.includes("casino") || msg.includes("taruhan") || msg.includes("betting") || msg.includes("togel")) {
    return `Ini situasi yang saya dengar banyak dari pengguna — hutang karena judi online bisa tumbuh sangat cepat dan terasa mustahil untuk keluar. 😔\n\nDua tantangan besar yang biasanya dihadapi:\n1. **Dorongan untuk "balik modal"** — ini jebakan paling berbahaya. Peluang menang dirancang agar kamu selalu kalah dalam jangka panjang.\n2. **Spiral pinjol** — pinjam untuk main, kalah, pinjam lagi.\n\n**Yang perlu dilakukan sekarang:**\n• 🚫 Stop total — tidak ada strategi menang yang konsisten di judi online\n• 📞 Hubungi **Pusat Konseling KPAI: 1500-771** atau **Into The Light: 119 ext 8** untuk dukungan psikologis\n• 📋 Daftarkan semua hutang judi ke Lunasin dan buat rencana pelunasan yang realistis\n• 🗣️ Bicarakan ke orang yang kamu percaya — menyimpan sendiri membuat ini lebih berat\n\nKeluar dari hutang judi itu bisa, tapi butuh dua langkah: selesaikan hutangnya **dan** atasi akar masalahnya. Saya bisa bantu yang pertama. 💪`;
  }

  // --- Rentenir / bank emok / pinjaman ilegal ---
  if (msg.includes("rentenir") || msg.includes("bank emok") || msg.includes("lintah darat") || msg.includes("pinjaman ilegal") || msg.includes("pinjol ilegal") || msg.includes("bunga harian") || msg.includes("bunga mingguan")) {
    return `Hutang ke rentenir atau pinjol ilegal itu situasi serius — bunganya bisa ratusan persen per tahun dan cara penagihannya sering tidak manusiawi. 😔\n\n**Yang perlu kamu tahu:**\n• Pinjol ilegal **tidak terdaftar di OJK** — artinya mereka beroperasi di luar hukum\n• Kontrak mereka seringkali tidak sah secara hukum\n• Mereka tidak punya kuasa hukum seperti lembaga resmi\n\n**Langkah menanganinya:**\n1. Cek apakah mereka terdaftar di OJK: **ojk.go.id/id/kanal/iknb/data-dan-statistik/direktori/Pages/Direktori-Perusahaan-Fintech.aspx**\n2. Kalau ilegal, **laporkan ke OJK: 157** dan **Satgas Waspada Investasi**\n3. Jangan bayar bunga berbunga yang tidak masuk akal — negosiasi hanya pokok\n4. Konsultasi ke **LBH (Lembaga Bantuan Hukum)** terdekat — banyak yang gratis untuk kasus ini\n\nKamu punya perlindungan hukum. Mereka yang ilegal justru lebih takut dari kamu. 💪`;
  }

  // --- SLIK / BI Checking / kredit macet / blacklist ---
  if (msg.includes("slik") || msg.includes("bi checking") || msg.includes("bi check") || msg.includes("blacklist") || msg.includes("black list") || msg.includes("kredit macet") || msg.includes("skor kredit") || msg.includes("credit score") || msg.includes("ideb")) {
    return `SLIK (Sistem Layanan Informasi Keuangan) itu yang dulu dikenal sebagai BI Checking — ini catatan riwayat kreditmu di semua lembaga keuangan.\n\n**Kolektibilitas kredit (skala 1–5):**\n• Kol 1 — Lancar ✅ (aman untuk ajukan kredit baru)\n• Kol 2 — Dalam Perhatian Khusus (1–90 hari macet)\n• Kol 3 — Kurang Lancar (91–120 hari macet)\n• Kol 4 — Diragukan (121–180 hari macet)\n• Kol 5 — Macet ❌ (susah dapat kredit baru)\n\n**Cara cek SLIK-mu:**\nKunjungi **idebku.ojk.go.id** — gratis dan resmi dari OJK.\n\n**Cara perbaiki skor:**\nSatu-satunya cara adalah **lunasi hutang yang bermasalah** dan konsisten bayar tepat waktu ke depannya. Setelah hutang lunas, minta surat keterangan lunas, lalu update di SLIK bisa makan waktu 1–2 bulan.\n\nMau saya bantu buat rencana pelunasan supaya SLIK-mu bisa membaik?`;
  }

  // --- PHK / kehilangan pekerjaan ---
  if (msg.includes("phk") || msg.includes("dipecat") || msg.includes("kena phk") || msg.includes("kehilangan pekerjaan") || msg.includes("tidak ada penghasilan") || msg.includes("nggak ada penghasilan") || msg.includes("pengangguran") || msg.includes("resign")) {
    return `Kena PHK sambil punya hutang itu salah satu tekanan terbesar — tapi ini situasi yang bisa dikelola kalau tahu langkahnya. 💙\n\n**Prioritas segera (minggu pertama):**\n1. **Hitung runway-mu** — berapa bulan kamu bisa bertahan dengan tabungan yang ada?\n2. **Hubungi semua kreditor sekarang** — jangan tunggu telat. Ceritakan situasimu dan minta keringanan atau restrukturisasi\n3. **Klaim BPJS Ketenagakerjaan JHT** — kalau sudah punya, ini bisa jadi bantalan sementara\n\n**Hak yang mungkin kamu dapat dari PHK:**\n• Pesangon (tergantung masa kerja dan jenis PHK)\n• Jaminan Kehilangan Pekerjaan (JKP) dari BPJS — bisa cair sampai 6 bulan\n\n**Soal hutangmu:**\nBank lebih suka kamu bayar sedikit daripada tidak sama sekali. Minta **penundaan cicilan** atau **penurunan angsuran** sementara selagi kamu cari kerja baru.\n\nSituasi ini sementara — dan kamu lebih kuat dari yang kamu kira. 💪`;
  }

  // --- Hutang ke saudara / teman / keluarga ---
  if (msg.includes("hutang ke") || msg.includes("pinjam ke") || msg.includes("saudara") || msg.includes("kakak") || msg.includes("adik") || msg.includes("orang tua") || msg.includes("teman") || msg.includes("sahabat") || msg.includes("hutang pribadi")) {
    return `Hutang ke orang terdekat itu beban yang berbeda — ada tekanan emosional yang sering lebih berat dari bunganya sendiri. 😔\n\n**Prinsip yang penting:**\n• Tetap perlakukan ini sebagai hutang nyata — jangan karena "keluarga" jadi tidak prioritas\n• **Komunikasi terbuka** jauh lebih penting dari pada menghindari — ketidakjelasan bikin hubungan retak\n• Kalau bisa, **buat catatan tertulis** (jumlah, rencana bayar) meski non-formal — ini lindungi hubunganmu\n\n**Kalau kamu lagi susah bayar:**\nJangan nunggu ditagih — hubungi duluan, jelaskan situasinya, dan kasih timeline realistis. Orang yang peduli sama kamu lebih suka dapat kejujuran daripada diam.\n\nDari data hutangmu, total kewajiban yang perlu kamu kejar adalah **${formatRp(totalSisa)}**. Mau saya bantu urutkan prioritasnya termasuk hutang ke orang dekat?`;
  }

  // --- Gali lubang tutup lubang / spiral hutang ---
  if (msg.includes("gali lubang") || msg.includes("tutup lubang") || msg.includes("pinjam lagi") || msg.includes("hutang baru") || msg.includes("pinjam buat bayar") || msg.includes("spiral") || msg.includes("lingkaran hutang")) {
    return `Ini salah satu situasi paling berbahaya dalam masalah hutang — dan kamu sudah tepat menyadarinya. 🚨\n\n"Gali lubang tutup lubang" itu terlihat seperti solusi tapi sebenarnya memperbesar masalah setiap siklusnya — karena:\n• Setiap pinjaman baru punya bunga baru\n• Total hutang terus bertambah meski terasa "sudah dibayar"\n• Pada akhirnya lubangnya jadi terlalu dalam\n\n**Cara keluar dari spiral ini:**\n1. **Stop mengambil hutang baru** — ini langkah satu-satunya yang paling penting\n2. **Inventarisasi semua hutang** — masukkan semua ke Lunasin agar kamu lihat gambaran utuh\n3. **Prioritaskan hutang dengan bunga tertinggi** — ini yang paling cepat membesar\n4. **Negosiasi restrukturisasi** — lebih baik cicilan kecil yang pasti dari pada besar yang berakhir spiral\n\nKamu udah sadar ada masalah — itu langkah pertama yang paling susah. Sekarang mari kita buat rencana yang nyata. 💪`;
  }

  // --- Budgeting / anggaran bulanan ---
  if (msg.includes("budget") || msg.includes("anggaran") || msg.includes("atur keuangan") || msg.includes("kelola keuangan") || msg.includes("bagi gaji") || msg.includes("alokasi") || msg.includes("pengeluaran") || msg.includes("50 30 20") || msg.includes("50/30/20")) {
    const gajiAman = Math.round(totalMin / 0.3);
    return pick([
      `Budgeting itu fondasi dari semua rencana keuangan — tanpa ini, rencana pelunasan hutang pun susah jalan.\n\nAturan paling populer adalah **50/30/20:**\n• **50%** untuk kebutuhan wajib (makan, sewa, listrik, cicilan)\n• **30%** untuk keinginan (hiburan, makan di luar, belanja)\n• **20%** untuk tabungan/extra bayar hutang\n\nTapi karena kamu lagi dalam mode melunasi hutang, saya sarankan modifikasi:\n• **50%** kebutuhan wajib\n• **10%** keinginan (sementara dikurangi)\n• **40%** agresif ke hutang\n\nTotal cicilan minimummu sekarang **${formatRp(totalMin)}/bulan** — artinya gaji minimal aman untuk kondisimu sekitar **${formatRp(gajiAman)}/bulan**. Mau saya bantu breakdown lebih detail?`,
      `Cara paling simpel untuk mulai budgeting:\n\n1. **Catat semua pemasukan** — gaji, freelance, side income\n2. **Catat semua pengeluaran tetap** — cicilan, sewa, tagihan\n3. **Hitung sisanya** — ini yang kamu punya untuk makan, hiburan, dan extra bayar hutang\n\nDari datamu, cicilan minimummu sudah **${formatRp(totalMin)}/bulan**. Angka ini harus jadi "biaya tetap" pertama yang dianggarkan sebelum apapun.\n\nTips: gunakan metode **amplop digital** — pisahkan uang ke rekening berbeda untuk cicilan, kebutuhan, dan darurat. Ini mencegah uang cicilan "terpakai duluan". 💡`,
    ]);
  }

  // --- Tips hemat / potong pengeluaran ---
  if (msg.includes("hemat") || msg.includes("potong pengeluaran") || msg.includes("kurangi") || msg.includes("tips keuangan") || msg.includes("irit") || msg.includes("saving tips") || msg.includes("cara hemat")) {
    return `Oke, kita cari cara biar ada lebih banyak uang untuk bayar hutang tiap bulan.\n\n**Pengeluaran yang paling mudah dipangkas:**\n• 📱 Cek langganan digital (streaming, gym, app) — matikan yang jarang dipakai\n• ☕ Kopi dan makan di luar — masak sendiri bisa hemat Rp 500rb–1jt/bulan\n• 🛒 Belanja impulsif — terapkan aturan **48 jam**: tunda pembelian non-darurat 2 hari, sering akhirnya batal\n• 📦 Ongkir & belanja online — batasi jadi sekali seminggu saja\n\n**Yang sering diabaikan tapi besar:**\n• Cek premi asuransi — banyak yang double atau tidak perlu\n• Renegosiasi tagihan internet/HP ke paket lebih murah\n• Jual barang yang tidak terpakai di Shopee/Tokopedia\n\nDari total cicilan **${formatRp(totalMin)}/bulan**, setiap Rp 100rb yang kamu hemat bisa langsung jadi extra payment yang memangkas waktu lunas. Mau saya hitung dampaknya?`;
  }

  // --- Side income / penghasilan tambahan ---
  if (msg.includes("penghasilan tambahan") || msg.includes("cari uang") || msg.includes("kerja sampingan") || msg.includes("side income") || msg.includes("usaha sampingan") || msg.includes("freelance") || msg.includes("income tambahan") || msg.includes("tambah penghasilan")) {
    return `Menambah penghasilan adalah cara tercepat mempercepat pelunasan — karena efeknya langsung ke extra payment tanpa harus potong kebutuhan hidup.\n\n**Ide yang bisa dimulai minggu ini (modal kecil/nol):**\n• 🛵 **Driver ojol / kurir** — fleksibel, bisa part-time\n• 💻 **Freelance online** — desain, nulis, translate, data entry di Fastwork/Sribulancer\n• 📸 **Jual foto/video** — kalau punya skill fotografi\n• 🍱 **Jualan makanan/minuman** — modal kecil, margin lumayan\n• 📚 **Les privat / tutoring** — kalau ada keahlian tertentu\n• ♻️ **Jual barang bekas** — bersihkan rumah, hasilkan uang\n\n**Aturan penting:** semua penghasilan tambahan langsung masuk ke pembayaran hutang — jangan naik gaya hidup dulu sebelum lunas.\n\nKalau extra payment Rp 500rb/bulan dari side income, itu bisa hemat berbulan-bulan dari timeline lunasmu. 💪`;
  }

  // --- KPR / kredit rumah ---
  if (msg.includes("kpr") || msg.includes("kredit rumah") || msg.includes("cicilan rumah") || msg.includes("mortgage") || msg.includes("rumah indent") || msg.includes("dp rumah")) {
    const kprDebts = debts.filter(d => d.name.toLowerCase().includes("kpr") || d.name.toLowerCase().includes("rumah"));
    if (kprDebts.length > 0) {
      return `Oke, saya lihat kamu punya KPR: **${kprDebts.map(d => `${d.name} (sisa ${formatRp(d.sisa || d.total)})`).join(", ")}**.\n\nKPR biasanya bunganya relatif rendah (7–12%) dibanding hutang lain, jadi dalam strategi pelunasan, ini biasanya bukan prioritas pertama kecuali bunganya floating dan lagi naik.\n\n**Beberapa opsi yang bisa kamu pertimbangkan:**\n• **Over kredit** — jual ke orang lain yang ambil alih KPR, kalau kamu butuh likuiditas\n• **Refinancing** — pindah bank dengan bunga lebih rendah, bisa hemat jutaan\n• **Pelunasan dipercepat** — cek apakah ada penalti prepayment di kontrakmu\n\nMau saya bandingkan prioritas KPR vs hutang lainmu?`;
    }
    return `KPR itu hutang jangka panjang (biasanya 15–30 tahun) dengan bunga relatif rendah — umumnya 7–12% per tahun.\n\nDalam strategi hutang, KPR biasanya diprioritaskan **terakhir** karena:\n• Bunganya lebih rendah dari kartu kredit/pinjol\n• Ada aset (rumah) sebagai jaminan\n• Keringanan pajak di beberapa kondisi\n\nTapi kalau bungamu floating dan sedang naik, atau kamu mau pindah dan over kredit, itu layak didiskusikan lebih dalam. Ceritakan situasinya?`;
  }

  // --- Kredit kendaraan / leasing ---
  if (msg.includes("leasing") || msg.includes("kredit motor") || msg.includes("kredit mobil") || msg.includes("kendaraan") || msg.includes("cicilan motor") || msg.includes("cicilan mobil") || msg.includes("fif") || msg.includes("adira") || msg.includes("acc ")) {
    const kendaraanDebts = debts.filter(d =>
      d.name.toLowerCase().includes("motor") ||
      d.name.toLowerCase().includes("mobil") ||
      d.name.toLowerCase().includes("leasing") ||
      d.name.toLowerCase().includes("kendaraan")
    );
    if (kendaraanDebts.length > 0) {
      return `Saya lihat kamu punya kredit kendaraan: **${kendaraanDebts.map(d => d.name).join(", ")}**.\n\nKredit kendaraan biasanya bunganya flat (berbeda dari efektif) — artinya 15% flat itu setara ~27% efektif per tahun, jauh lebih mahal dari yang kelihatan!\n\n**Opsi yang mungkin tersedia:**\n• **Jual dan lunasi** — kalau value kendaraan masih di atas sisa hutang, ini bisa jadi pilihan\n• **Over kredit** — alihkan ke pembeli baru (pastikan lewat leasing, bukan bawah tangan)\n• **Lanjut bayar** — kalau kendaraan masih produktif untuk cari income\n\nTips: tanyakan ke leasing apakah ada **diskon pelunasan dipercepat** — beberapa leasing kasih potongan bunga sisa kalau kamu lunasi sekaligus.`;
    }
    return `Kredit kendaraan pakai bunga **flat** yang kelihatan rendah (misal 10%) tapi secara efektif lebih tinggi (sekitar 18-20% efektif per tahun).\n\nKalau kamu lagi evaluasi apakah perlu tetap punya kendaraan atau tidak, hitung total biaya kepemilikan: cicilan + bensin + parkir + servis + pajak — bandingkan dengan ongkos transportasi umum. Kadang jual kendaraan bisa jadi langkah terbaik untuk melunasi hutang lebih cepat.`;
  }

  // --- Konsolidasi hutang ---
  if (msg.includes("konsolidasi") || msg.includes("gabung hutang") || msg.includes("satukan hutang") || msg.includes("pinjam satu") || msg.includes("refinancing") || msg.includes("pindah hutang")) {
    return `Konsolidasi hutang itu strategi yang menarik — intinya, gabung semua hutang jadi **satu pinjaman dengan bunga lebih rendah**.\n\nContoh: hutang kartu kredit 26% + pinjol 24% → digabung jadi KTA 14% → cicilan lebih rendah, satu tempat, lebih mudah dikontrol.\n\n**Kapan konsolidasi masuk akal:**\n• Kamu punya banyak hutang dengan bunga tinggi yang sulit dilacak\n• Kamu dapat penawaran pinjaman baru dengan bunga lebih rendah dari rata-rata hutangmu\n• Kamu butuh satu cicilan tetap yang predictable\n\n**Kapan JANGAN konsolidasi:**\n• Hanya untuk dapat "nafas sementara" tapi tidak ubah kebiasaan — nanti hutang lama muncul lagi\n• Bunga konsolidasi ternyata tidak lebih rendah setelah dihitung total\n\nRata-rata bunga hutangmu sekarang **${avgInterest.toFixed(1)}%** — kalau ada tawaran konsolidasi di bawah angka itu, layak dipertimbangkan serius. 💡`;
  }

  // --- Hutang dan pasangan / suami istri ---
  if (msg.includes("suami") || msg.includes("istri") || msg.includes("pasangan") || msg.includes("menikah") || msg.includes("cerai") || msg.includes("pernikahan") || msg.includes("keluarga") && msg.includes("hutang")) {
    return `Hutang dalam konteks pernikahan itu kompleks — ada dimensi hukum dan emosional sekaligus.\n\n**Fakta hukum dasar (Indonesia):**\n• Hutang yang dibuat **setelah menikah** dianggap hutang bersama (harta bersama), kecuali ada perjanjian pisah harta\n• Hutang **sebelum menikah** tetap tanggung jawab masing-masing\n• Saat cerai, hutang bersama dibagi sesuai putusan pengadilan\n\n**Yang sering terjadi dan susah:**\n• Salah satu pasangan punya hutang rahasia\n• Pasangan tidak setuju soal prioritas pelunasan\n• Tekanan hutang memperburuk hubungan\n\n**Saran saya:**\nHutang paling efektif diselesaikan kalau dua-duanya transparan dan satu arah. Kalau ada ketegangan soal ini, diskusi terbuka (atau konseling keuangan bersama) bisa lebih efektif dari strategi keuangan terbaik sekalipun.\n\nMau saya bantu buat rencana yang bisa dikomunikasikan ke pasangan?`;
  }

  // --- Modal usaha / UMKM / bisnis ---
  if (msg.includes("usaha") || msg.includes("bisnis") || msg.includes("umkm") || msg.includes("modal") || msg.includes("toko") || msg.includes("dagangan") || msg.includes("warung") || msg.includes("startup")) {
    return `Hutang untuk usaha itu berbeda dengan hutang konsumtif — ini investasi yang harusnya menghasilkan balik modal.\n\nCara menilai apakah hutang usahamu sehat:\n• **ROI > bunga hutang?** → kalau usahamu untung 30% tapi bunga hutang 15%, itu masuk akal\n• **Cash flow cukup untuk cicilan?** → pastikan pendapatan usaha bisa nutup cicilan tiap bulan\n\n**Kalau usaha sedang susah:**\n• Pisahkan keuangan usaha dan pribadi — jangan campur\n• Evaluasi mana produk/layanan paling untung, fokus ke sana\n• Pertimbangkan restrukturisasi pinjaman usaha ke bank — program KUR (Kredit Usaha Rakyat) bunganya lebih rendah\n\n**Program yang bisa dimanfaatkan:**\n• **KUR Mikro** — sampai Rp 100 juta, bunga 6% per tahun (subsidi pemerintah)\n• **PNM Mekaar** — khusus perempuan pelaku usaha mikro\n• **BPUM** — hibah untuk UMKM (cek di oss.go.id)\n\nMau diskusi lebih soal kondisi usahamu?`;
  }

  // --- Cara kerja bunga / edukasi finansial ---
  if (msg.includes("cara kerja bunga") || msg.includes("bunga majemuk") || msg.includes("compound") || msg.includes("bunga flat") || msg.includes("bunga efektif") || msg.includes("bedanya bunga") || msg.includes("belajar keuangan") || msg.includes("literasi")) {
    return `Pertanyaan yang bagus — pahami ini dan kamu bakal jauh lebih bijak dalam keputusan keuangan.\n\n**Dua jenis bunga yang paling umum:**\n\n📌 **Bunga Flat** (banyak di leasing, KTA)\n• Dihitung dari pokok awal, bukan sisa hutang\n• Contoh: hutang 10 juta, bunga 10%/tahun, tenor 2 tahun → bunga = Rp 2 juta total, flat\n• Kelihatannya murah, tapi secara efektif lebih mahal\n\n📌 **Bunga Efektif / Anuitas** (banyak di KPR, kartu kredit)\n• Dihitung dari sisa pokok — makin kecil sisa, makin kecil bunga\n• Makin awal kamu bayar extra, makin besar penghematannya\n\n📌 **Bunga Majemuk (Compound)**\n• Bunga dikenakan ke pokok + bunga sebelumnya\n• Ini yang bikin kartu kredit "minimum payment" sangat berbahaya\n\n**Rule of 72:** bagi 72 dengan suku bunga = berapa tahun hutang jadi dua kali lipat kalau tidak dibayar. Contoh: bunga 24% → hutang dobel dalam 3 tahun. 😱\n\nMau saya jelaskan jenis bunga di hutang-hutangmu spesifik?`;
  }

  // --- Setelah lunas / financial planning pasca hutang ---
  if (msg.includes("setelah lunas") || msg.includes("sudah bebas hutang") || msg.includes("selesai hutang") || msg.includes("bebas hutang") || msg.includes("habis lunas") || msg.includes("next step") || msg.includes("langkah selanjutnya")) {
    return `Ini pertanyaan yang paling saya suka! 🎉\n\nBebas hutang bukan finish line — ini starting line untuk membangun kekayaan yang sesungguhnya.\n\n**Urutan prioritas setelah lunas:**\n\n1. **Dana Darurat** — target 3–6x pengeluaran bulanan, simpan di rekening terpisah (bukan deposito dulu)\n2. **Dana Pensiun** — mulai investasi rutin ke reksa dana atau DPLK, manfaatkan compound interest\n3. **Tujuan Finansial Spesifik** — beli rumah, dana pendidikan anak, dll\n\n**Prinsip terpenting:**\nUang cicilan yang selama ini kamu bayar — alihkan **semua** ke investasi. Kalau kamu bisa bayar ${formatRp(totalMin)}/bulan ke hutang, kamu juga bisa "bayar dirimu sendiri" segitu setiap bulan.\n\nDengan ${formatRp(totalMin)}/bulan selama 20 tahun di reksa dana saham (rata-rata 12%/tahun), kamu bisa punya sekitar **Rp 3–5 miliar**. Itu kekuatan compound interest yang berpihak padamu. 💰`;
  }

  // --- Hutang yang sudah lama / daluwarsa ---
  if (msg.includes("hutang lama") || msg.includes("hutang lupa") || msg.includes("sudah lama") || msg.includes("daluwarsa") || msg.includes("kadaluarsa") || msg.includes("tahun lalu") || msg.includes("10 tahun") || msg.includes("5 tahun") || msg.includes("hutang lama")) {
    return `Pertanyaan yang sering ditanyakan tapi jarang ada jawabannya — soal hutang lama. 👀\n\n**Di Indonesia, hutang perdata punya batas waktu penuntutan (daluwarsa):**\n• Hutang umum (KTA, kartu kredit): **30 tahun** (Pasal 1967 KUH Perdata)\n• Tagihan jasa/sewa: **5 tahun**\n• Batas ini bisa "direset" jika kamu mengakui hutang secara tertulis atau bayar sebagian\n\n**Realitanya:**\nBank dan lembaga keuangan bisa menjual hutang macet ke perusahaan penagih utang (debt buyer), yang kemudian masih bisa mencoba menagih meskipun sudah lama.\n\n**Saran saya:**\n• Jangan abaikan — cek apakah masih tercatat di SLIK/OJK\n• Kalau muncul tagihan tiba-tiba untuk hutang lama, minta bukti tertulis dan verifikasi ke OJK\n• Konsultasi ke **LBH terdekat** kalau ada sengketa — seringkali gratis\n\nCeritakan lebih detail hutang lamanya seperti apa?`;
  }

  // --- Tidak tahu mulai dari mana / overwhelmed ---
  if (msg.includes("tidak tahu") || msg.includes("nggak tahu") || msg.includes("bingung") || msg.includes("mulai dari mana") || msg.includes("overwhelmed") || msg.includes("pusing") || msg.includes("nggak ngerti") || msg.includes("banyak banget") || msg.includes("susah banget")) {
    return pick([
      `Wajar banget merasa bingung — hutang lebih dari satu itu memang overwhelming kalau dilihat sekaligus. Tapi kita sederhanakan.\n\nSatu hal yang perlu kamu lakukan hari ini:\n\n**Tulis semua hutangmu** — nama, sisa, bunga, cicilan minimum. Kalau sudah di Lunasin, berarti langkah ini sudah selesai. ✅\n\nNah, dari data yang sudah ada, saya bisa kasih tahu:\n• Hutang mana yang harus dibayar duluan\n• Berapa lama kira-kira lunas\n• Apa yang paling menghemat uang\n\nMau mulai dari situ? Tanyakan apapun — satu per satu, tidak perlu semuanya sekaligus.`,
      `Saya mengerti rasa itu — lihat total hutang **${formatRp(totalSisa)}** sekaligus bisa bikin sesak napas.\n\nTapi begini cara saya lihatnya: kamu sudah melewati bagian tersulit, yaitu mengakui dan mencatat semua hutangmu. Banyak orang nggak sampai sini karena takut lihat angkanya.\n\nSekarang kita cuma perlu satu langkah kecil. Pilih salah satu:\n• "Saya mau tahu hutang mana yang dilunasi duluan"\n• "Saya mau tahu kapan kira-kira bisa lunas"\n• "Saya nggak bisa bayar bulan ini, apa yang harus dilakukan"\n\nKetik salah satu, dan kita urai bareng-bareng. Nggak perlu selesai semua hari ini. 💙`,
    ]);
  }

  // --- Warisan hutang / hutang orang tua meninggal ---
  if (msg.includes("warisan hutang") || msg.includes("hutang orang tua") || msg.includes("meninggal") || msg.includes("almarhum") || msg.includes("pewaris") || msg.includes("waris") || msg.includes("hutang ayah") || msg.includes("hutang ibu")) {
    return `Ini topik yang sering bikin orang panik — tapi ada kabar baiknya. 💙\n\n**Fakta hukum penting:**\nDi Indonesia, **ahli waris TIDAK otomatis mewarisi hutang** — hutang diselesaikan dari harta warisan (aset almarhum) lebih dulu.\n\n**Prosesnya:**\n1. Harta almarhum dikumpulkan (aset – hutang = harta bersih)\n2. Kalau aset > hutang → ahli waris dapat sisa harta bersih\n3. Kalau aset < hutang → ahli waris bisa **menolak warisan** secara hukum agar tidak menanggung kekurangannya\n\n**Cara menolak warisan:**\nAjukan ke Pengadilan Negeri setempat dalam waktu tertentu — lebih baik konsultasikan ke notaris atau LBH.\n\n**Yang perlu dihindari:**\nJangan pernah mau "sukarela" bayar hutang almarhum tanpa melalui proses hukum yang benar — itu bisa dianggap mengakui kewajiban yang sebenarnya bukan milikmu.\n\nKalau ada pihak yang memaksa kamu bayar hutang keluarga yang meninggal, minta bukti legal dan konsultasi ke LBH terdekat dulu. 🙏`;
  }

  // --- Penghasilan tidak tetap / freelancer / buruh harian ---
  if (msg.includes("freelancer") || msg.includes("tidak tetap") || msg.includes("nggak tetap") || msg.includes("penghasilan tidak pasti") || msg.includes("musiman") || msg.includes("harian") || msg.includes("borongan") || msg.includes("proyek") || msg.includes("kontrak")) {
    return `Mengatur hutang dengan penghasilan tidak tetap itu tantangan tersendiri — tapi bisa diakali.\n\n**Strategi untuk penghasilan fluktuatif:**\n\n💡 **Tentukan "gaji minimum" untuk dirimu sendiri**\nHitung rata-rata penghasilan 3 bulan terakhir → ambil 80% angka terendah sebagai "budget aman" bulanan.\n\n💡 **Metode persentase, bukan nominal**\nDaripada target "bayar Rp 1 juta/bulan", ubah ke "bayar 20% dari apapun yang masuk bulan ini" — lebih realistis.\n\n💡 **Buat buffer bulan gemuk**\nSaat penghasilan lagi besar, sisihkan sebagian ke tabungan khusus cicilan — dipakai saat bulan tipis.\n\n💡 **Komunikasikan ke kreditor**\nBeberapa bank dan lembaga keuangan bisa menyesuaikan jadwal cicilan dengan income cycle — terutama kalau kamu proaktif hubungi mereka.\n\nTotal cicilanmu **${formatRp(totalMin)}/bulan** — ini angka minimum yang harus kamu jaga. Mau diskusi strategi lebih spesifik?`;
  }

  // --- Default ---
  return pick([
    `Saya coba analisis pertanyaanmu, tapi butuh konteks lebih — bisa kamu ceritain lebih spesifik?\n\nSementara itu, ini ringkasan kondisi hutangmu:\n• **Total sisa:** ${formatRp(totalSisa)}\n• **Hutang aktif:** ${activeDebts.length}\n• **Cicilan minimum total:** ${formatRp(totalMin)}/bulan\n• **Hutang bunga tertinggi:** ${highestInterest.name} (${highestInterest.interest}%)\n\nContoh pertanyaan yang bisa kamu tanyakan:\n• "Strategi terbaik untuk saya?"\n• "Kapan saya bisa lunas kalau bayar segini?"\n• "Bagaimana cara negosiasi hutang?"\n• "Saya ditagih DC, apa yang harus dilakukan?"`,
    `Hmm, saya kurang yakin kamu nanya soal apa persisnya — boleh diperjelas sedikit?\n\nTapi kalau mau langsung ke intinya: dari profil hutangmu, prioritas utama saya rekomendasikan adalah **${highestInterest.name}** karena bunganya paling tinggi (${highestInterest.interest}%). Sementara untuk motivasi awal, coba lunasi **${smallestDebt.name}** dulu karena sisanya paling kecil.\n\nMau saya jelaskan lebih detail?`,
  ]);
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { response: "Kamu sudah mencapai batas 30 pesan per jam. Istirahat sebentar dan coba lagi nanti ya! 🙏" },
        { status: 429 }
      );
    }

    let debts = [];
    if (user) {
      const { data } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user.id);
      if (data && data.length > 0) debts = data;
    }

    if (debts.length === 0) {
      return NextResponse.json({
        response: "Halo! Sebelum saya bisa bantu analisis, kamu perlu tambahkan data hutangmu dulu di menu **Hutang Saya**.\n\nSetelah data masuk, saya bisa kasih saran yang spesifik dan personal — bukan jawaban generik. Langsung ke sana ya, nggak butuh lama! 😊"
      });
    }

    const response = generateResponse(message, debts);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { response: "Aduh, ada gangguan teknis nih — coba lagi sebentar ya? Saya di sini kalau kamu mau nanya lagi. 🙏" },
      { status: 500 }
    );
  }
}
