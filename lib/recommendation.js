export function recommend(debts) {
  if (!debts || debts.length === 0) return "Semua hutang sudah lunas! 🎉";
  
  const highInterest = [...debts].sort(
    (a, b) => Number(b.interest || 0) - Number(a.interest || 0)
  )[0];

  return `Prioritaskan ${highInterest.name || 'hutang dengan bunga tertinggi'} karena bunganya paling tinggi.`;
}
