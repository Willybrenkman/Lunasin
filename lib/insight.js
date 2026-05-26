export function generateInsight({ months, totalInterest, extraPayment = 0, strategy = "" }) {
  if (!months) return "Memproses data...";

  if (months <= 6) {
    return "Luar biasa! Kamu hampir bebas hutang. Pertahankan ritme ini dan kamu akan merdeka dalam hitungan bulan 🚀";
  }

  if (months <= 12) {
    return "Kondisi hutangmu sangat sehat. Dengan strategi sekarang, kamu bisa bebas hutang dalam setahun 💪";
  }

  if (extraPayment > 0 && months <= 24) {
    return `Extra payment kamu sangat membantu! Total bunga yang dibayar ${formatRp(totalInterest)} — jauh lebih hemat dibanding tanpa extra payment ✅`;
  }

  if (totalInterest > 10000000 && extraPayment === 0) {
    return `Tanpa extra payment, kamu akan membayar bunga sebesar ${formatRp(totalInterest)}. Coba tambah Rp 100rb-500rb/bulan untuk hemat jutaan rupiah 💡`;
  }

  if (totalInterest > 5000000) {
    return `Bunga terhitung ${formatRp(totalInterest)} — cukup besar. Fokus ke hutang bunga tertinggi dulu untuk menekan angka ini ⚠️`;
  }

  if (months > 60) {
    return `Masih ${months} bulan lagi — perjalanan panjang. Extra payment sekecil apapun akan sangat berarti untuk memperpendek durasi ini 💡`;
  }

  return "Kamu sudah di jalur yang benar. Konsisten bayar cicilan dan hindari hutang baru untuk mempercepat kebebasanmu 🎯";
}

function formatRp(amount) {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

export function generateSimulasiInsight({ months, totalInterest, baselineMonths, baselineInterest, extraPayment, strategy }) {
  if (!months) return "";

  const savedMonths = baselineMonths - months;
  const savedInterest = baselineInterest - totalInterest;

  if (extraPayment > 0 && savedMonths > 0) {
    return `Dengan extra payment ${formatRp(extraPayment)}/bulan, kamu hemat ${savedMonths} bulan dan ${formatRp(savedInterest)} bunga dibanding tanpa extra payment. Strategi ${strategy} optimal untuk kondisi hutangmu saat ini.`;
  }

  if (extraPayment > 0 && savedMonths === 0) {
    return `Extra payment membantu menghemat bunga sebesar ${formatRp(savedInterest)}, meski durasi tidak banyak berubah. Coba naikkan extra payment untuk memperpendek waktu lunas.`;
  }

  if (months > 60) {
    return `Tanpa extra payment, butuh ${months} bulan untuk lunas dengan total bunga ${formatRp(totalInterest)}. Tambah extra payment untuk memotong durasi ini secara signifikan.`;
  }

  return `Estimasi lunas ${months} bulan dengan total bunga ${formatRp(totalInterest)}. Coba jalankan simulasi dengan extra payment untuk melihat penghematan yang bisa kamu raih.`;
}
