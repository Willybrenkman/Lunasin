export function getUpcomingDebts(debts) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const clampDay = (year, month, day) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDay));
  };

  return debts.filter((d) => {
    if (!d.tanggal_tagihan) return false;

    let dueDate = clampDay(today.getFullYear(), today.getMonth(), d.tanggal_tagihan);
    if (dueDate < todayStart) {
      dueDate = clampDay(today.getFullYear(), today.getMonth() + 1, d.tanggal_tagihan);
    }

    const diffDays = Math.ceil((dueDate - todayStart) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });
}
