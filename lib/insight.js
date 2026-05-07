export function generateInsight(result) {
  if (!result) return "Memproses data...";
  if (result.months <= 12) {
    return "Strategi kamu sudah sangat baik 🚀. Terus pertahankan ritme pembayaran ini!";
  }

  if (result.totalInterest > 5000000) {
    return "Fokus ke hutang bunga tinggi dulu ⚠️. Bunga yang kamu bayar cukup besar.";
  }

  return "Tambah extra payment untuk mempercepat pelunasan 💡. Bahkan 100rb ekstra sangat membantu.";
}
