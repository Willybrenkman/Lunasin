export function getUpcomingDebts(debts) {
  const today = new Date();

  return debts.filter((d) => {
    if (!d.due_date) return false;
    const due = new Date(d.due_date);
    const diff = (due - today) / (1000 * 60 * 60 * 24);

    return diff <= 3 && diff >= 0; // Extended to H-3 for better UX
  });
}
