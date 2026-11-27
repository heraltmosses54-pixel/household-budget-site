// verify-v2.mjs — reconciliation checks for the v2 budget site.
// Loads app/data.js with a stubbed window and asserts every number
// the site can display reconciles exactly. Run: node verify-v2.mjs
import { readFileSync } from 'node:fs';

global.window = { localStorage: { getItem: () => null, setItem: () => {} } };
const src = readFileSync(new URL('./app/data.js', import.meta.url), 'utf8');
eval(src);
const D = window.BudgetData;
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

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
