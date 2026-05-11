import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// ============================================================
// LUNASIN AI ENGINE — Rule-Based Financial Advisor
// Menganalisis data hutang user dan memberikan saran spesifik
// ============================================================

function formatRp(num) {
  return `Rp ${Number(num).toLocaleString("id-ID")}`;
}

function analyzeDebts(debts) {
  const totalSisa = debts.reduce((s, d) => s + Number(d.sisa || d.total), 0);
  const totalMin = debts.reduce((s, d) => s + Number(d.min_payment), 0);
  const highestInterest = debts.reduce((max, d) => Number(d.interest) > Number(max.interest) ? d : max, debts[0]);
  const smallestDebt = debts.reduce((min, d) => Number(d.sisa || d.total) < Number(min.sisa || min.total) ? d : min, debts[0]);
  const activeDebts = debts.filter(d => Number(d.sisa || d.total) > 0);
  const paidOff = debts.filter(d => Number(d.sisa || d.total) <= 0);
  const avgInterest = debts.length > 0 ? debts.reduce((s, d) => s + Number(d.interest), 0) / debts.length : 0;

  return { totalSisa, totalMin, highestInterest, smallestDebt, activeDebts, paidOff, avgInterest };
}

function generateResponse(message, debts) {
  const msg = message.toLowerCase();
  const analysis = analyzeDebts(debts);
  const { totalSisa, totalMin, highestInterest, smallestDebt, activeDebts, avgInterest } = analysis;

  // ---- Keyword-based responses ----

  if (msg.includes("strategi") || msg.includes("cara") || msg.includes("metode") || msg.includes("bagaimana")) {
    if (msg.includes("snowball")) {
      return `**Strategi Snowball** cocok untuk kamu yang butuh motivasi cepat.\n\nCaranya: Lunasi hutang dengan sisa **terkecil** lebih dulu, yaitu **${smallestDebt.name}** (sisa ${formatRp(smallestDebt.sisa || smallestDebt.total)}).\n\nSetelah itu lunas, alihkan cicilan ${formatRp(smallestDebt.min_payment)}/bulan ke hutang berikutnya. Efek bola salju ini akan mempercepat pelunasan secara psikologis.`;
    }
    if (msg.includes("avalanche") || msg.includes("longsor")) {
      return `**Strategi Avalanche** adalah pilihan paling hemat secara matematis.\n\nFokuskan extra payment ke **${highestInterest.name}** karena bunganya paling tinggi (${highestInterest.interest}% per tahun). Dengan begitu, total bunga yang kamu bayar secara keseluruhan akan berkurang drastis.\n\nSisa hutangmu saat ini: ${formatRp(totalSisa)}.`;
    }
    return `Berdasarkan profil hutangmu, saya merekomendasikan:\n\n🏆 **Smart Priority** — Gabungan Snowball + Avalanche.\n\n1. Lunasi **${smallestDebt.name}** (${formatRp(smallestDebt.sisa || smallestDebt.total)}) lebih dulu untuk motivasi.\n2. Lalu fokus ke **${highestInterest.name}** (bunga ${highestInterest.interest}%) untuk hemat bunga.\n\nTotal sisa hutangmu: ${formatRp(totalSisa)} dengan cicilan minimum ${formatRp(totalMin)}/bulan.`;
  }

  if (msg.includes("pinjol") || msg.includes("pinjaman online")) {
    const pinjolDebts = debts.filter(d => d.name.toLowerCase().includes("pinjaman online") || d.name.toLowerCase().includes("pinjol"));
    if (pinjolDebts.length > 0) {
      return `⚠️ Saya melihat kamu punya pinjaman online: **${pinjolDebts.map(d => d.name).join(", ")}**.\n\nTips penting:\n1. **JANGAN pernah** meminjam pinjol baru untuk menutup yang lama.\n2. Jika kamu ditagih DC dengan cara kasar, kamu bisa laporkan ke OJK di 157.\n3. Prioritaskan pelunasan pinjol karena bunganya biasanya paling tinggi (${pinjolDebts[0].interest}%).\n4. Jika kesulitan bayar, hubungi CS pinjol dan minta **restrukturisasi**.`;
    }
    return `Pinjaman Online (Pinjol) harus menjadi prioritas pelunasan karena bunganya biasanya sangat tinggi. Jangan pernah gali lubang tutup lubang. Jika kamu merasa tertekan oleh Debt Collector, kamu punya hak hukum yang dilindungi UU PDP. Hubungi OJK di 157 jika ada pelanggaran.`;
  }

  if (msg.includes("paylater") || msg.includes("pay later") || msg.includes("shopee") || msg.includes("kredivo") || msg.includes("gopay")) {
    return `PayLater memang terlihat "ringan", tapi denda keterlambatannya bisa sangat membebani.\n\nTips:\n1. **Selalu bayar sebelum jatuh tempo** — denda telat bisa 5-10% per hari.\n2. Jangan gunakan PayLater untuk belanja impulsif.\n3. Sisa PayLater-mu saat ini masuk dalam total ${formatRp(totalSisa)}.\n\nSaran: Lunasi PayLater lebih dulu karena biasanya cicilannya kecil dan cepat selesai. Ini akan memberikanmu motivasi! 💪`;
  }

  if (msg.includes("gaji") || msg.includes("penghasilan") || msg.includes("income")) {
    return `Untuk menganalisis kesehatan cicilanmu, saya perlu tahu gajimu.\n\n📊 **Aturan DTI (Debt-to-Income Ratio):**\n- Total cicilanmu saat ini: **${formatRp(totalMin)}/bulan**\n- Batas aman cicilan = **30% dari gaji**\n- Artinya, gajimu minimal harus **${formatRp(Math.round(totalMin / 0.3))}/bulan** agar cicilan masih aman.\n\nJika gajimu di bawah angka itu, kamu perlu mencari penghasilan tambahan atau melakukan restrukturisasi hutang.`;
  }

  if (msg.includes("bunga") || msg.includes("interest")) {
    return `📊 **Analisis Bunga Hutangmu:**\n\n${debts.map(d => `• ${d.name}: **${d.interest}%** per tahun`).join("\n")}\n\n🔴 Hutang dengan bunga tertinggi: **${highestInterest.name}** (${highestInterest.interest}%)\n\nRata-rata bunga hutangmu: **${avgInterest.toFixed(1)}%**. Fokuslah melunasi yang bunganya paling tinggi terlebih dahulu untuk menghemat uang dalam jangka panjang.`;
  }

  if (msg.includes("lunas") || msg.includes("kapan") || msg.includes("estimasi") || msg.includes("berapa lama")) {
    const monthsEstimate = Math.ceil(totalSisa / totalMin);
    return `📅 **Estimasi Waktu Lunas:**\n\nDengan cicilan minimum ${formatRp(totalMin)}/bulan:\n• Perkiraan lunas dalam **${monthsEstimate} bulan** (tanpa extra payment)\n• Jika tambah Rp 500.000/bulan → sekitar **${Math.ceil(totalSisa / (totalMin + 500000))} bulan**\n• Jika tambah Rp 1.000.000/bulan → sekitar **${Math.ceil(totalSisa / (totalMin + 1000000))} bulan**\n\n💡 Setiap tambahan Rp 100.000/bulan bisa memangkas waktu lunas secara signifikan!`;
  }

  if (msg.includes("motivasi") || msg.includes("semangat") || msg.includes("putus asa") || msg.includes("stress") || msg.includes("depresi")) {
    return `🌟 Kamu sudah mengambil langkah yang benar dengan menggunakan Lunasin.id!\n\nIngat:\n1. **Hutang bukan akhir segalanya.** Jutaan orang berhasil keluar dari situasi yang sama.\n2. Kamu sudah punya ${activeDebts.length} hutang aktif — dan setiap cicilan yang kamu bayar adalah **kemajuan nyata**.\n3. Fokus pada yang bisa kamu kontrol: potong pengeluaran, cari income tambahan, dan ikuti rencana.\n\n💪 *"The best time to start was yesterday. The second best time is now."*\n\nSaya di sini 24/7 untuk membantu. Jangan menyerah! 🔥`;
  }

  if (msg.includes("restrukturisasi") || msg.includes("negosiasi") || msg.includes("keringanan")) {
    return `📋 **Panduan Restrukturisasi Hutang:**\n\n1. **Hubungi CS bank/pinjol** — Minta keringanan cicilan atau perpanjangan tenor.\n2. **Siapkan surat resmi** — Gunakan template di menu "Bonus Premium".\n3. **Jelaskan kondisimu** — Bank lebih suka negosiasi daripada kehilangan uang.\n4. Yang bisa dinegosiasikan:\n   • Penurunan bunga\n   • Perpanjangan tenor\n   • Penghapusan denda\n   • Pembayaran pokok saja (tanpa bunga)\n\n⚖️ Kamu juga dilindungi UU PDP jika ada penyebaran data oleh DC ilegal.`;
  }

  if (msg.includes("dc") || msg.includes("debt collector") || msg.includes("ditagih") || msg.includes("teror")) {
    return `🛡️ **Hak Kamu vs Debt Collector:**\n\n1. DC **tidak boleh** menagih di luar jam 08.00-20.00.\n2. DC **tidak boleh** mengancam, memaki, atau menyebar data pribadi.\n3. DC **tidak boleh** menghubungi keluarga/teman kamu.\n\nJika dilanggar:\n• Screenshot semua bukti\n• Laporkan ke **OJK: 157** atau **ojk.go.id**\n• Gunakan template Surat Teguran UU PDP di menu "Bonus Premium"\n\nJangan takut! Hukum ada di pihakmu. 💪`;
  }

  // Default: ringkasan profil hutang
  return `Berdasarkan data hutangmu:\n\n📊 **Ringkasan Profil Keuangan:**\n• Total sisa hutang: **${formatRp(totalSisa)}**\n• Jumlah hutang aktif: **${activeDebts.length}**\n• Total cicilan minimum: **${formatRp(totalMin)}/bulan**\n• Hutang bunga tertinggi: **${highestInterest.name}** (${highestInterest.interest}%)\n• Hutang sisa terkecil: **${smallestDebt.name}** (${formatRp(smallestDebt.sisa || smallestDebt.total)})\n\nApa yang ingin kamu konsultasikan? Misalnya:\n• "Strategi terbaik untuk saya"\n• "Kapan saya bisa lunas?"\n• "Bagaimana cara negosiasi hutang?"\n• "Saya ditagih DC, apa yang harus dilakukan?"`;
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        response: "Kamu belum menambahkan data hutang. Silakan tambahkan hutang terlebih dahulu di menu **Hutang Saya** agar saya bisa menganalisis dan memberikan saran yang tepat untuk kondisi keuanganmu. 📊"
      });
    }

    const response = generateResponse(message, debts);

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { response: "Maaf, terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
