export function calculateDTI(debts, income) {
  if (!debts || debts.length === 0 || !income) return 0;
  
  const monthlyDebt = debts.reduce(
    (sum, d) => sum + Number(d.min_payment || 0),
    0
  );

  return ((monthlyDebt / income) * 100).toFixed(1);
}
