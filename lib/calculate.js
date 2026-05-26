/**
 * Lunasin Calculation Engine
 */

function smartScore(debt) {
  const remaining = Number(debt.remaining ?? debt.sisa ?? 0);
  const interest = Number(debt.interest);
  const interestNorm = Math.min(interest / 60, 1.0);
  const monthlyCost = remaining * (interest / 100 / 12);
  const costNorm = Math.min(monthlyCost / 1000000, 1.0);
  const monthlyNet = Number(debt.min_payment) - monthlyCost;
  const monthsToPayoff = monthlyNet > 0 ? Math.ceil(remaining / monthlyNet) : Infinity;
  const quickWinBonus = monthsToPayoff > 0 && monthsToPayoff <= 6 ? 0.3 : 0;
  return interestNorm * 0.5 + costNorm * 0.3 + quickWinBonus * 0.2;
}

/**
 * Detects debts where min_payment cannot cover monthly interest (will never pay off).
 */
export function detectNonConvergent(debts) {
  return debts
    .filter(d => {
      const remaining = Number(d.sisa ?? d.total ?? 0);
      if (remaining <= 0) return false;
      const monthlyInterest = remaining * (Number(d.interest) / 100 / 12);
      return Number(d.min_payment) <= monthlyInterest;
    })
    .map(d => {
      const remaining = Number(d.sisa ?? d.total ?? 0);
      const monthlyInterest = remaining * (Number(d.interest) / 100 / 12);
      return {
        name: d.name,
        minPayment: Number(d.min_payment),
        monthlyInterest: Math.round(monthlyInterest),
        suggestedMin: Math.ceil(monthlyInterest * 1.5),
      };
    });
}

function sortByStrategy(list, strategy) {
  if (strategy === "snowball") {
    list.sort((a, b) => (a.remaining ?? 0) - (b.remaining ?? 0));
  } else if (strategy === "smart priority") {
    list.sort((a, b) => smartScore(b) - smartScore(a));
  } else {
    list.sort((a, b) => Number(b.interest) - Number(a.interest));
  }
}

/**
 * Simulates a payoff strategy and returns summary statistics.
 * Uses a fixed monthly budget (sum of all initial min_payments + extraPayment)
 * so that freed payments from paid-off debts cascade to the next priority debt.
 */
export function simulate(debts, strategy, extraPayment = 0) {
  let month = 0;
  let totalInterest = 0;
  const nonConvergentNames = new Set();

  let active = debts.map(d => ({
    ...d,
    remaining: Number(d.sisa ?? d.total ?? 0),
    interestRate: Number(d.interest) / 100,
    stuckMonths: 0,
    lastRemaining: Number(d.sisa ?? d.total ?? 0)
  }));

  if (!active.some(d => d.remaining > 0)) {
    return { months: 0, totalInterest: 0, hasNonConvergent: false, nonConvergentDebts: [] };
  }

  // Fixed budget: sum of ALL min_payments + extra (cascade effect when debt is paid off)
  const monthlyBudget = active.reduce((s, d) => s + Number(d.min_payment || 0), 0) + extraPayment;

  while (active.some(d => d.remaining > 0) && month < 600) {
    month++;

    // Re-sort each month — critical for Smart Priority as scores shift as remaining changes
    sortByStrategy(active, strategy);

    // 1. Accrue interest on all active debts
    for (const d of active) {
      if (d.remaining <= 0) continue;
      const interest = d.remaining * (d.interestRate / 12);
      d.remaining += interest;
      totalInterest += interest;
    }

    // 2. Pay minimums on all active debts
    let available = monthlyBudget;
    for (const d of active) {
      if (d.remaining <= 0) continue;
      const minPay = Math.min(Number(d.min_payment), d.remaining);
      d.remaining -= minPay;
      available -= minPay;
    }

    // 3. Cascade remaining budget into priority debt
    for (const d of active) {
      if (d.remaining <= 0 || available <= 0) continue;
      const extra = Math.min(available, d.remaining);
      d.remaining -= extra;
      available -= extra;
    }

    // 4. Non-convergent detection: if remaining not decreasing for 3 months → write off
    for (const d of active) {
      if (d.remaining <= 0) {
        d.stuckMonths = 0;
        d.lastRemaining = 0;
        continue;
      }
      if (d.remaining >= d.lastRemaining) {
        d.stuckMonths++;
        if (d.stuckMonths >= 3) {
          nonConvergentNames.add(d.name);
          d.remaining = 0;
        }
      } else {
        d.stuckMonths = 0;
      }
      d.lastRemaining = d.remaining;
    }
  }

  return {
    months: month,
    totalInterest: Math.round(totalInterest),
    hasNonConvergent: nonConvergentNames.size > 0,
    nonConvergentDebts: Array.from(nonConvergentNames)
  };
}

/**
 * Calculates a month-by-month payoff plan for charting.
 * Return shape { month, total, baseline }[] must remain stable — chart depends on it.
 */
export function calculatePlan(debts, strategy, extraPayment = 0) {
  let result = [];
  let month = 0;

  let activeDebts = debts.map(d => ({
    ...d,
    remaining: Number(d.sisa ?? d.total ?? 0),
    interestRate: Number(d.interest) / 100
  }));

  const baselinePlan = calculateBaseline(debts, strategy);

  const monthlyBudget = activeDebts.reduce((s, d) => s + Number(d.min_payment || 0), 0) + extraPayment;
  const stuckMap = new Map();

  while (activeDebts.some(d => d.remaining > 0) && month < 600) {
    month++;

    sortByStrategy(activeDebts, strategy);

    for (let d of activeDebts) {
      if (d.remaining <= 0) continue;
      d.remaining += d.remaining * (d.interestRate / 12);
    }

    let available = monthlyBudget;
    for (let d of activeDebts) {
      if (d.remaining <= 0) continue;
      const minPay = Math.min(Number(d.min_payment), d.remaining);
      d.remaining -= minPay;
      available -= minPay;
    }

    for (let d of activeDebts) {
      if (d.remaining <= 0 || available <= 0) continue;
      const extra = Math.min(available, d.remaining);
      d.remaining -= extra;
      available -= extra;
    }

    // Non-convergent detection: write off debts stuck for 3 months
    for (const d of activeDebts) {
      if (d.remaining <= 0) { stuckMap.delete(d.name); continue; }
      const prev = stuckMap.get(d.name) ?? { months: 0, last: d.remaining };
      if (d.remaining >= prev.last) {
        const stuck = prev.months + 1;
        if (stuck >= 3) { d.remaining = 0; stuckMap.delete(d.name); }
        else stuckMap.set(d.name, { months: stuck, last: d.remaining });
      } else {
        stuckMap.set(d.name, { months: 0, last: d.remaining });
      }
    }

    const monthlyTotal = activeDebts.reduce((s, d) => s + Math.max(0, d.remaining), 0);
    result.push({
      month,
      total: Math.round(monthlyTotal),
      baseline: baselinePlan[month - 1]?.total || 0
    });
  }

  if (extraPayment > 0) {
    const baselineEnd = baselinePlan.length;
    for (let i = month; i < baselineEnd && i < 600; i++) {
      result.push({
        month: i + 1,
        total: 0,
        baseline: baselinePlan[i]?.total || 0
      });
    }
  }

  return result;
}

function calculateBaseline(debts, strategy) {
  let result = [];
  let month = 0;
  let active = debts.map(d => ({
    ...d,
    remaining: Number(d.sisa ?? d.total ?? 0),
    interestRate: Number(d.interest) / 100
  }));

  sortByStrategy(active, strategy);

  const monthlyBudget = active.reduce((s, d) => s + Number(d.min_payment || 0), 0);
  const stuckMap = new Map();

  while (active.some(d => d.remaining > 0) && month < 600) {
    month++;

    for (let d of active) {
      if (d.remaining <= 0) continue;
      d.remaining += d.remaining * (d.interestRate / 12);
    }

    let available = monthlyBudget;
    for (let d of active) {
      if (d.remaining <= 0) continue;
      const minPay = Math.min(Number(d.min_payment), d.remaining);
      d.remaining -= minPay;
      available -= minPay;
    }

    for (let d of active) {
      if (d.remaining <= 0 || available <= 0) continue;
      const extra = Math.min(available, d.remaining);
      d.remaining -= extra;
      available -= extra;
    }

    for (const d of active) {
      if (d.remaining <= 0) { stuckMap.delete(d.name); continue; }
      const prev = stuckMap.get(d.name) ?? { months: 0, last: d.remaining };
      if (d.remaining >= prev.last) {
        const stuck = prev.months + 1;
        if (stuck >= 3) { d.remaining = 0; stuckMap.delete(d.name); }
        else stuckMap.set(d.name, { months: stuck, last: d.remaining });
      } else {
        stuckMap.set(d.name, { months: 0, last: d.remaining });
      }
    }

    const monthlyTotal = active.reduce((s, d) => s + Math.max(0, d.remaining), 0);
    result.push({ month, total: Math.round(monthlyTotal) });
  }
  return result;
}

/**
 * Compares Snowball vs Avalanche strategies.
 */
export function compareStrategies(debts, extraPayment) {
  if (!debts || debts.length === 0) return null;

  const snowball = simulate(debts, "snowball", extraPayment);
  const avalanche = simulate(debts, "avalanche", extraPayment);

  return {
    snowball,
    avalanche,
    faster: snowball.months < avalanche.months ? "Snowball" : "Avalanche",
    cheaper: snowball.totalInterest < avalanche.totalInterest ? "Snowball" : "Avalanche",
    interestSavings: Math.abs(snowball.totalInterest - avalanche.totalInterest)
  };
}

/**
 * Calculates Debt Health Score (0-100).
 * progressScore: how much has been paid off (0-70pt)
 * activityScore: payment history activity (0-30pt)
 */
export function getDebtHealth(debts, payments = []) {
  if (!debts || debts.length === 0) {
    return { score: 70, label: "Sehat", color: "text-[#22C55E]", progressScore: 70, activityScore: 0 };
  }

  const totalHutang = debts.reduce((s, d) => s + Number(d.total || 0), 0);
  const sisaHutang = debts.reduce((s, d) => s + Number(d.sisa ?? d.total ?? 0), 0);
  const totalTerbayar = Math.max(0, totalHutang - sisaHutang);

  const progressScore = totalHutang > 0 ? Math.round((totalTerbayar / totalHutang) * 70) : 0;
  const activityScore = payments.length >= 3 ? 30 : payments.length > 0 ? 15 : 0;
  const score = Math.min(100, progressScore + activityScore);

  let label, color;
  if (score >= 80) { label = "Sehat"; color = "text-[#22C55E]"; }
  else if (score >= 60) { label = "Cukup Baik"; color = "text-gold"; }
  else if (score >= 40) { label = "Waspada"; color = "text-gold"; }
  else { label = "Perlu Perhatian"; color = "text-red-400"; }

  return { score, label, color, progressScore, activityScore };
}

export function getSmartPriority(debts) {
  return debts
    .map(d => ({ ...d, score: smartScore(d) }))
    .sort((a, b) => b.score - a.score);
}
