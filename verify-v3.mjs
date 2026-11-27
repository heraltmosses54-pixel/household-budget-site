// verify-v3.mjs — reconciliation checks for the v3 budget site.
// v2 checks kept whole, plus the new pace / daily / weekly / planner math.
// Run: node verify-v3.mjs
import { readFileSync } from 'node:fs';

global.window = { localStorage: { getItem: () => null, setItem: () => {} } };
for (const f of ['./app/data.js', './app/charts.js', './app/views.js']) {
  eval(readFileSync(new URL(f, import.meta.url), 'utf8'));
}
const D = window.BudgetData;
const V = window.BudgetViews;
const s = D.loadState();
let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) fails++;
}

for (const ym of ['2026-10', '2026-11']) {
  const t = D.monthTotals(s, ym);
  const byCat = D.categorySpent(s, ym);
  const catSum = Object.values(byCat).reduce((a, b) => a + b, 0);
  check(ym + ' income - spent = saved', t.income - t.spent === t.saved, `${t.income} - ${t.spent} = ${t.saved}`);
  check(ym + ' category sums = spent', catSum === t.spent, `${catSum} = ${t.spent}`);
  check(ym + ' no future-dated rows', D.monthTx(s, ym).every((x) => x.date <= D.TODAY), D.TODAY);
  check(ym + ' no negative amounts', D.monthTx(s, ym).every((x) => x.amount > 0));
}

const nov = D.monthTotals(s, '2026-11');
const oct = D.monthTotals(s, '2026-10');
check('Nov totals', nov.income === 8300000 && nov.spent === 6330000 && nov.saved === 1970000,
  `in ${nov.income} spent ${nov.spent} saved ${nov.saved}`);
check('Oct totals', oct.income === 8100000 && oct.spent === 4539000 && oct.saved === 3561000,
  `in ${oct.income} spent ${oct.spent} saved ${oct.saved}`);
check('10 categories', D.CATEGORIES.length === 10);
check('budget total 7,800,000', Object.values(s.budgets).reduce((a, b) => a + b, 0) === 7800000);
check('Nov tx count 48', D.monthTx(s, '2026-11').length === 48);
check('Oct tx count 32', D.monthTx(s, '2026-10').length === 32);

const f = D.fiftyThirtyTwenty(s, '2026-11');
check('50/30/20 sums to income', f.needs + f.wants + f.saved === f.income, `${f.needs}+${f.wants}+${f.saved}=${f.income}`);
check('50/30/20 pcts 68/8/24', f.needsPct === 68 && f.wantsPct === 8 && f.savedPct === 24,
  `${f.needsPct}/${f.wantsPct}/${f.savedPct}`);

const ss = D.safeSpend(s, '2026-11');
check('safe-spend 490,000/day x 3 days', ss.perDay === 490000 && ss.daysLeft === 3 && ss.remaining === 1470000,
  `${ss.perDay}/day, ${ss.daysLeft} days, ${ss.remaining} left`);

const bills = D.billsFor(s, '2026-11');
check('9 bills, 8 paid, 1 pending', bills.length === 9 && bills.filter((b) => b.paid).length === 8 && bills.filter((b) => !b.paid).length === 1);
check('bills total 2,304,000 / paid 2,279,000',
  bills.reduce((a, b) => a + b.amount, 0) === 2304000 && bills.filter((b) => b.paid).reduce((a, b) => a + b.amount, 0) === 2279000);
check('pending bill is sampah 25,000', bills.filter((b) => !b.paid).every((b) => b.name === 'Iuran sampah RT' && b.amount === 25000));

const debt = D.debtInfo();
check('debt paid 12,600,000 (28 x 450,000)', debt.paid === 12600000);
check('debt remaining 5,400,000 (12 x 450,000)', debt.remaining === 5400000 && debt.remainingCount === 12);

for (const g of s.goals) {
  check('goal history sums to saved: ' + g.name, D.goalHistorySum(g) === g.saved, `${D.goalHistorySum(g)} = ${g.saved}`);
}
const novAlloc = s.goals.reduce((a, g) => a + (g.history || []).filter((h) => h[0] === 'Nov 2026').reduce((x, h) => x + h[1], 0), 0);
check('Nov goal allocations 1,250,000; cash 720,000', novAlloc === 1250000 && nov.saved - novAlloc === 720000);

const series = D.trendSeries(s);
check('trend is 6 months', series.length === 6);
check('trend Nov matches ledger', series[5].income === nov.income && series[5].spent === nov.spent);
check('trend Oct matches ledger', series[4].income === oct.income && series[4].spent === oct.spent);
const novVsOct = nov.spent - oct.spent;
check('Nov vs Oct +1,791,000 (+39%)', novVsOct === 1791000 && Math.round((novVsOct / oct.spent) * 100) === 39);

// ---- v3: daily + weekly ----
const novDaily = D.dailySpend(s, '2026-11');
const octDaily = D.dailySpend(s, '2026-10');
check('Nov daily has 30 days', novDaily.length === 30);
check('Oct daily has 31 days', octDaily.length === 31);
check('Nov daily sums to spent', novDaily.reduce((a, d) => a + d.spent, 0) === nov.spent);
check('Oct daily sums to spent', octDaily.reduce((a, d) => a + d.spent, 0) === oct.spent);
check('Nov day 7 = 530,000 (bills + sedekah)', novDaily[6].spent === 530000 && novDaily[6].count === 3);
const novWeeks = D.weeklySpend(s, '2026-11');
check('Nov weekly sums to spent', novWeeks.reduce((a, w) => a + w.spent, 0) === nov.spent);
check('Nov weeks 1,966,000 / 1,871,000 / 1,528,000 / 965,000 / 0',
  novWeeks.map((w) => w.spent).join(',') === '1966000,1871000,1528000,965000,0',
  novWeeks.map((w) => w.spent).join(','));

// ---- v3: pace ----
const p = D.pace(s, '2026-11');
check('pace elapsed 27 of 30', p.elapsed === 27 && p.days === 30);
check('pace avg 234,444/day', p.avgPerDay === 234444, String(p.avgPerDay));
check('pace projected 7,033,320 spent / 1,266,680 saved',
  p.projectedSpent === 7033320 && p.projectedSaved === 1266680,
  `${p.projectedSpent} / ${p.projectedSaved}`);
check('pace on track vs 7,800,000 budget', p.onTrack === true);

// ---- v3: biggest + busiest ----
const big = D.biggestPurchase(s, '2026-11');
check('biggest purchase SPP 650,000 on 2026-11-05',
  big.amount === 650000 && big.date === '2026-11-05' && big.desc.indexOf('SPP') === 0, big.desc);
const busy = D.busiestDay(s, '2026-11');
check('busiest day 10 Nov at 813,000 (internet + cicilan + market)', busy.day === 10 && busy.spent === 813000);

// ---- v3: goal planner + month labels ----
check('monthAddLabel +8 = Jul 2027', D.monthAddLabel('2026-11', 8) === 'Jul 2027');
check('monthAddLabel +14 = Jan 2028', D.monthAddLabel('2026-11', 14) === 'Jan 2028');
const g1 = s.goals[0], g2 = s.goals[1], g3 = s.goals[2];
const p1 = D.goalPlan(g1, 500000), p2 = D.goalPlan(g2, 500000), p3 = D.goalPlan(g3, 500000);
check('emergency fund @500k: 8 months to Jul 2027',
  p1.remaining === 3750000 && p1.months === 8 && p1.finish === 'Jul 2027', JSON.stringify(p1));
check('fridge @500k: 4 months to Mar 2027',
  p2.remaining === 1700000 && p2.months === 4 && p2.finish === 'Mar 2027', JSON.stringify(p2));
check('Dieng trip @500k: 5 months to Apr 2027',
  p3.remaining === 2100000 && p3.months === 5 && p3.finish === 'Apr 2027', JSON.stringify(p3));
check('goalPlan with no amount: months null', D.goalPlan(g1, 0).months === null);
check('goalPlan reached goal: months 0',
  D.goalPlan({ target: 100, saved: 100 }, 50000).months === 0);

// ---- v3: what-if planner ----
const w30 = D.whatIf(s, '2026-11', 30);
check('what-if 30%: allowed 5,810,000, cut 520,000',
  w30.allowedSpend === 5810000 && w30.cutNeeded === 520000, `${w30.allowedSpend} / ${w30.cutNeeded}`);
check('what-if 30%: top cut is Food 151,975',
  w30.cuts[0].name === 'Food & Market' && w30.cuts[0].cut === 151975, JSON.stringify(w30.cuts[0]));
check('what-if 30%: 3 cuts shown', w30.cuts.length === 3);
const w20 = D.whatIf(s, '2026-11', 20);
check('what-if 20%: already met (cut -310,000)',
  w20.allowedSpend === 6640000 && w20.cutNeeded === -310000 && w20.cuts.length === 0);

// ---- v3: views render without error and carry the new figures ----
const dash = V.dashboard(s, '2026-11');
check('dashboard shows pace 234,444', dash.indexOf('Rp 234.444') !== -1);
check('dashboard shows projected 7,033,320', dash.indexOf('Rp 7.033.320') !== -1);
check('dashboard shows biggest purchase', dash.indexOf('SPP anak') !== -1);
const txHtml = V.transactions(s, '2026-11', 'all', 'pasar', 'amount-desc');
const txRows = (txHtml.match(/<tr data-id/g) || []).length;
check('transactions search "pasar" shows exactly 5 rows', txRows === 5, txRows + ' rows');
check('transactions search "pasar" keeps Pasar rows', txHtml.indexOf('Pasar Minggu') !== -1);
check('transactions search count line', txHtml.indexOf('rows shown') !== -1);
const rep = V.reports(s, '2026-11');
check('reports shows daily chart', rep.indexOf('Daily spending') !== -1);
check('reports shows week 1 chip 1,966,000', rep.indexOf('Rp 1.966.000') !== -1);
check('reports shows what-if 520,000 cut', rep.indexOf('Rp 520.000') !== -1);
check('reports shows goal planner Jul 2027', rep.indexOf('Jul 2027') !== -1);
check('reports what-if text fn', V.whatIfText(w30).indexOf('Rp 520.000') !== -1);
check('reports goal plan text fn', V.goalPlanText(g1, 500000, p1).indexOf('Jul 2027') !== -1);

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
