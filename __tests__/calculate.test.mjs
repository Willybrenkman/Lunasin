import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, detectNonConvergent, getDebtHealth, calculatePlan } from "../lib/calculate.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const debt = (name, sisa, interest, min_payment) => ({
  name, sisa, total: sisa, interest, min_payment
});

// ─── Cascade fix ────────────────────────────────────────────────────────────

test("cascade: freed min_payment from paid-off debt flows to next priority debt", () => {
  // A: 1000 sisa, 0% interest, min 1000 → paid off in month 1
  // B: 3000 sisa, 0% interest, min 500
  // Budget = 1000 + 500 = 1500/month (constant)
  // Month 1: A paid off. B pays min 500. 1000 freed → cascades to B → B = 2500 - 1000 = 1500
  // Month 2: B pays min 500 + 1000 cascade → B = 0
  // Done in 3 months (vs 6 without cascade)
  const A = debt("A", 1000, 0, 1000);
  const B = debt("B", 3000, 0, 500);
  const result = simulate([A, B], "avalanche", 0);
  assert.equal(result.months, 3, "cascade should reduce payoff from 6 to 3 months");
});

test("cascade: extra payment after A payoff reaches B in same month", () => {
  // A: 2000 sisa, 0%, min 2000 → paid off month 1
  // B: 6000 sisa, 0%, min 1000
  // Budget = 3000. After A gone: B gets 3000/month → done in 3 months
  const A = debt("A", 2000, 0, 2000);
  const B = debt("B", 6000, 0, 1000);
  const result = simulate([A, B], "avalanche", 0);
  assert.ok(result.months <= 4, `expected <=4 months with cascade, got ${result.months}`);
});

// ─── Non-convergent detection ────────────────────────────────────────────────

test("detectNonConvergent: flags debt where min_payment <= monthly interest", () => {
  const pinjol = debt("Pinjol", 100_000, 36, 2_000); // monthly interest = 3000 > 2000 min
  const safe   = debt("KPR",   100_000,  6, 2_000);  // monthly interest = 500 < 2000 min
  const result = detectNonConvergent([pinjol, safe]);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Pinjol");
  assert.equal(result[0].monthlyInterest, 3_000);
  assert.ok(result[0].suggestedMin > result[0].monthlyInterest);
});

test("detectNonConvergent: returns empty array when all debts are convergent", () => {
  const safe = debt("KPR", 100_000, 6, 2_000);
  assert.deepEqual(detectNonConvergent([safe]), []);
});

test("detectNonConvergent: skips fully paid debts (sisa=0)", () => {
  const paid = { name: "Paid", sisa: 0, total: 100_000, interest: 99, min_payment: 1 };
  assert.deepEqual(detectNonConvergent([paid]), []);
});

// ─── simulate() return shape ─────────────────────────────────────────────────

test("simulate: returns hasNonConvergent=true and nonConvergentDebts when detected", () => {
  const pinjol = debt("Pinjol", 100_000, 36, 2_000);
  const result = simulate([pinjol], "avalanche", 0);
  assert.equal(result.hasNonConvergent, true);
  assert.equal(result.nonConvergentDebts.length, 1);
  // nonConvergentDebts is now an array of name strings (detected in-loop, not pre-skip)
  assert.equal(result.nonConvergentDebts[0], "Pinjol");
  // debt runs for 3 months before being written off (in-loop detection threshold)
  assert.ok(result.months >= 3, `expected months >= 3, got ${result.months}`);
});

test("simulate: returns hasNonConvergent=false when all debts are safe", () => {
  const safe = debt("KPR", 100_000, 6, 2_000);
  const result = simulate([safe], "avalanche", 0);
  assert.equal(result.hasNonConvergent, false);
  assert.deepEqual(result.nonConvergentDebts, []);
  assert.ok(result.months > 0);
});

test("simulate: extra payment reduces months vs baseline", () => {
  const d = debt("Hutang", 120_000, 12, 5_000);
  const withExtra    = simulate([d], "avalanche", 5_000);
  const withoutExtra = simulate([d], "avalanche", 0);
  assert.ok(withExtra.months < withoutExtra.months, "extra payment should reduce payoff time");
  assert.ok(withExtra.totalInterest < withoutExtra.totalInterest, "extra payment should reduce total interest");
});

// ─── getDebtHealth ────────────────────────────────────────────────────────────

test("getDebtHealth: calculates score from progress + activity", () => {
  const debts    = [{ total: 1_000_000, sisa: 500_000 }]; // 50% paid off
  const payments = new Array(5).fill({ amount: 100_000 }); // 5 payments
  const h = getDebtHealth(debts, payments);
  // progressScore = round((500000/1000000) * 70) = 35
  // activityScore = 30 (>=3 payments)
  // score = 65
  assert.equal(h.progressScore, 35);
  assert.equal(h.activityScore, 30);
  assert.equal(h.score, 65);
  assert.equal(h.label, "Cukup Baik");
});

test("getDebtHealth: zero payments gives activityScore=0", () => {
  const debts = [{ total: 1_000_000, sisa: 500_000 }];
  const h = getDebtHealth(debts, []);
  assert.equal(h.activityScore, 0);
  assert.equal(h.score, 35);
});

test("getDebtHealth: empty debts returns default score 70 Sehat", () => {
  const h = getDebtHealth([]);
  assert.equal(h.score, 70);
  assert.equal(h.label, "Sehat");
});

test("getDebtHealth: fully paid debts gives progressScore=70", () => {
  const debts = [{ total: 1_000_000, sisa: 0 }];
  const payments = new Array(3).fill({});
  const h = getDebtHealth(debts, payments);
  assert.equal(h.progressScore, 70);
  assert.equal(h.score, 100);
});

// ─── calculatePlan ────────────────────────────────────────────────────────────

test("calculatePlan: returns stable { month, total, baseline } shape", () => {
  const d = debt("KPR", 10_000, 12, 1_000);
  const plan = calculatePlan([d], "avalanche", 0);
  assert.ok(plan.length > 0);
  for (const entry of plan) {
    assert.ok("month" in entry, "missing month");
    assert.ok("total" in entry, "missing total");
    assert.ok("baseline" in entry, "missing baseline");
    assert.ok(typeof entry.month === "number");
    assert.ok(typeof entry.total === "number");
    assert.ok(typeof entry.baseline === "number");
  }
});

test("calculatePlan: with extra payment, total reaches 0 sooner", () => {
  const d = debt("Hutang", 120_000, 12, 5_000);
  const withExtra    = calculatePlan([d], "avalanche", 5_000);
  const withoutExtra = calculatePlan([d], "avalanche", 0);
  // Plan extends past payoff to show baseline tail, so compare when total first hits 0
  const paidWithExtra    = withExtra.findIndex(e => e.total === 0);
  const paidWithoutExtra = withoutExtra.findIndex(e => e.total === 0);
  assert.ok(paidWithExtra < paidWithoutExtra, `extra payment should reach payoff sooner (${paidWithExtra} vs ${paidWithoutExtra})`);
});

test("calculatePlan: total approaches 0 at last entry", () => {
  const d = debt("Hutang", 10_000, 6, 2_000);
  const plan = calculatePlan([d], "avalanche", 0);
  const last = plan[plan.length - 1];
  assert.ok(last.total <= 1, `expected final total near 0, got ${last.total}`);
});
