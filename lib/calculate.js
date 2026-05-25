/**
 * Lunasin Calculation Engine
 * Contains logic for debt payoff strategies, simulations, and financial health scores.
 */

/**
 * Calculates a payoff plan based on a specific strategy.
 * @param {Array} debts - List of debt objects
 * @param {string} strategy - 'snowball' or 'avalanche'
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

  // Strategy Sorting
  if (strategy === "snowball") {
    activeDebts.sort((a, b) => a.remaining - b.remaining);
  } else if (strategy === "smart priority") {
    activeDebts.sort((a, b) => {
      const scoreA = Number(a.interest) * 1.5 + (a.remaining / 1000000) * 0.5;
      const scoreB = Number(b.interest) * 1.5 + (b.remaining / 1000000) * 0.5;
      return scoreB - scoreA;
    });
  } else {
    // Avalanche: highest interest rate first
    activeDebts.sort((a, b) => b.interest - a.interest);
  }

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

  if (strategy === "snowball") {
    active.sort((a, b) => a.remaining - b.remaining);
  } else if (strategy === "smart priority") {
    active.sort((a, b) => {
      const scoreA = Number(a.interest) * 1.5 + (a.remaining / 1000000) * 0.5;
      const scoreB = Number(b.interest) * 1.5 + (b.remaining / 1000000) * 0.5;
      return scoreB - scoreA;
    });
  } else {
    active.sort((a, b) => b.interest - a.interest);
  }

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

  if (strategy === "snowball") {
    active.sort((a, b) => a.remaining - b.remaining);
  } else if (strategy === "smart priority") {
    active.sort((a, b) => {
      const scoreA = Number(a.interest) * 1.5 + (a.remaining / 1000000) * 0.5;
      const scoreB = Number(b.interest) * 1.5 + (b.remaining / 1000000) * 0.5;
      return scoreB - scoreA;
    });
  } else {
    active.sort((a, b) => b.interest - a.interest);
  }

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
  return debts.map(d => {
    const interestWeight = Number(d.interest) * 1.5;
    const sizeWeight = (Number(d.sisa ?? d.total ?? 0) / 1000000) * 0.5;
    const score = interestWeight + sizeWeight;

    return { ...d, score };
  }).sort((a, b) => b.score - a.score);
}
