import { getSmartPriority } from "@/lib/calculate";

export function recommend(debts) {
  if (!debts || debts.length === 0) return "Semua hutang sudah lunas! 🎉";

  const active = debts.filter(d => Number(d.sisa ?? d.total ?? 0) > 0);
  if (active.length === 0) return "Semua hutang sudah lunas! 🎉";

  const priority = getSmartPriority(active)[0];
  return `Prioritaskan ${priority?.name || 'hutang teratas'} berdasarkan Smart Priority — gabungan bunga tertinggi, sisa terbesar, dan potensi lunas tercepat.`;
}
