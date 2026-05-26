/**
 * Lunasin Calculation Engine
 * Contains logic for debt payoff strategies, simulations, and financial health scores.
 */

/**
 * Smart Priority score — dimensi-konsisten.
 * Pinjol kecil berbunga tinggi lebih prioritas dari KPR besar berbunga rendah.
 */
function smartScore(debt) {
  const interestNorm = Number(debt.interest) / 30; // 30% = maks referensi
  const monthlyCost = Number(debt.remaining ?? debt.sisa ?? 0) * (Number(debt.interest) / 100 / 12);
  const costNorm = Math.min(monthlyCost / 500000, 1); // Rp500rb/bln = 1.0
  const smallBonus = Number(debt.remaining ?? debt.sisa ?? 0) < 5000000 ? 0.3 : 0;
  return interestNorm * 0.5 + costNorm * 0.3 + smallBonus * 0.2;
}

/**
 * Deteksi hutang yang cicilan minimumnya tidak bisa menutup bunga bulanan.
 * Kembalikan array hutang bermasalah beserta saran cicilan minimum yang aman.
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
 * Calculates a payoff plan based on a specific strategy.
 * @param {Array} debts - List of debt objects
 * @param {string} strategy - 'snowball' | 'avalanche' | 'smart priority'
 * @param {number} extraPayment - Additional monthly payment amount
 */
export function calculatePlan(debts, strategy, extraPayment = 0) {
  let result = [];
  let month = 0;

  // Clone debts to avoid mutating original data
  let activeDebts = debts.map(d => ({
    ...d,
    remaining: Number(d.sisa ?? d.total ?? 0),
    interestRate: Number(d.interest) / 100 // Convert percentage to decimal
  }));

  sortByStrategy(activeDebts, strategy);

  // Calculate a separate baseline plan (0 extra payment)
  const baselinePlan = calculateBaseline(debts, strategy);

  // Deteksi hutang yang cicilan minimumnya < bunga bulanan (tidak akan pernah lunas)
  for (let debt of activeDebts) {
    const monthlyInterest = debt.remaining * (debt.interestRate / 12);
    if (debt.remaining > 0 && Number(debt.min_payment) <= monthlyInterest) {
      debt.remaining = 0; // Skip hutang yang tidak konvergen
    }
  }

  while (activeDebts.some(d => d.remaining > 0)) {
    month++;
    let extra = extraPayment;
    let monthlyTotal = 0;

    for (let debt of activeDebts) {
      if (debt.remaining <= 0) continue;

      const interestAmount = debt.remaining * (debt.interestRate / 12);
      debt.remaining += interestAmount;

      let payment = Number(debt.min_payment);

      if (extra > 0) {
        payment += extra;
        extra = 0;
      }

      if (payment > debt.remaining) {
        extra = payment - debt.remaining;
        debt.remaining = 0;
      } else {
        debt.remaining -= payment;
      }

      monthlyTotal += debt.remaining;
    }

    result.push({
      month,
      total: Math.round(monthlyTotal),
      baseline: baselinePlan[month - 1]?.total || 0
    });

    if (month > 600) break;
  }

  // Lanjutkan baseline setelah total lunas supaya chart menunjukkan
  // perbedaan nyata antara dengan dan tanpa extra payment
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

/**
 * Internal helper to calculate baseline without extra payment
 */
function calculateBaseline(debts, strategy) {
  let result = [];
  let month = 0;
  let active = debts.map(d => ({
    ...d,
    remaining: Number(d.sisa ?? d.total ?? 0),
    interestRate: Number(d.interest) / 100
  }));

  sortByStrategy(active, strategy);

  for (let d of active) {
    const monthlyInterest = d.remaining * (d.interestRate / 12);
    if (d.remaining > 0 && Number(d.min_payment) <= monthlyInterest) {
      d.remaining = 0;
    }
  }

  while (active.some(d => d.remaining > 0)) {
    month++;
    let monthlyTotal = 0;
    for (let d of active) {
      if (d.remaining <= 0) continue;
      d.remaining += d.remaining * (d.interestRate / 12);
      d.remaining -= Math.min(d.remaining, Number(d.min_payment));
      monthlyTotal += d.remaining;
    }
    result.push({ month, total: Math.round(monthlyTotal) });
    if (month > 600) break;
  }
  return result;
}

/**
 * Simulates a strategy to get summary statistics.
 */
export function simulate(debts, strategy, extraPayment = 0) {
  let month = 0;
  let totalInterest = 0;

  let active = debts.map(d => ({
    ...d,
    remaining: Number(d.sisa ?? d.total ?? 0),
    interestRate: Number(d.interest) / 100
  }));

  sortByStrategy(active, strategy);

  for (let d of active) {
    const monthlyInterest = d.remaining * (d.interestRate / 12);
    if (d.remaining > 0 && Number(d.min_payment) <= monthlyInterest) {
      d.remaining = 0;
    }
  }

  while (active.some(d => d.remaining > 0)) {
    month++;
    let extra = extraPayment;

    for (let d of active) {
      if (d.remaining <= 0) continue;

      const interest = d.remaining * (d.interestRate / 12);
      d.remaining += interest;
      totalInterest += interest;

      let pay = Number(d.min_payment);

      if (extra > 0) {
        pay += extra;
        extra = 0;
      }

      if (pay > d.remaining) {
        extra = pay - d.remaining;
        d.remaining = 0;
      } else {
        d.remaining -= pay;
      }
    }

    if (month > 600) break;
  }

  return {
    months: month,
    totalInterest: Math.round(totalInterest)
  };
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
 */
export function getDebtHealth(debts) {
  if (!debts || debts.length === 0) return { score: 100, label: "Sehat" };

  const totalDebt = debts.reduce((s, d) => s + Number(d.sisa ?? d.total ?? 0), 0);
  const avgInterest = debts.reduce((s, d) => s + Number(d.interest), 0) / debts.length;

  let score = 100;

  // Deduct for high debt volume
  if (totalDebt > 50000000) score -= 30;
  else if (totalDebt > 10000000) score -= 15;

  // Deduct for high interest rates
  if (avgInterest > 20) score -= 40;
  else if (avgInterest > 10) score -= 20;

  let label = "Sehat";
  if (score < 40) label = "Berisiko";
  else if (score < 75) label = "Waspada";

  return { score, label };
}

/**
 * Smart Priority Score based on interest, size, and minimum payment weight.
 */
export function getSmartPriority(debts) {
  return debts
    .map(d => ({ ...d, score: smartScore(d) }))
    .sort((a, b) => b.score - a.score);
}
