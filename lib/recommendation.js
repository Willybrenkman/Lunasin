export function recommend(debts) {
  if (!debts || debts.length === 0) return "Semua hutang sudah lunas! 🎉";

  const active = debts.filter(d => Number(d.sisa ?? d.total ?? 0) > 0);
  if (active.length === 0) return "Semua hutang sudah lunas! 🎉";

  const highInterest = [...active].sort(
    (a, b) => Number(b.interest || 0) - Number(a.interest || 0)
  )[0];

  return `Prioritaskan ${highInterest.name || 'hutang dengan bunga tertinggi'} karena bunganya paling tinggi.`;
}
