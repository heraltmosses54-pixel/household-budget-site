// data.js — the Santoso family's seeded budget data (November + October 2026)
// and the small state layer every view reads from. All figures are Rupiah.
// One source of truth: every total, chart and bar on the site is computed
// from these transactions, so the numbers can never disagree with each other.

(function () {
  'use strict';

  var CATEGORIES = [
    { id: 'food',      name: 'Food & Market',    color: '#2e7d5b' },
    { id: 'transport', name: 'Transport',        color: '#3e6fb0' },
    { id: 'bills',     name: 'Bills & Internet', color: '#b07a1e' },
    { id: 'school',    name: 'School',           color: '#7a4fa3' },
    { id: 'household', name: 'Household',        color: '#4d8a8a' },
    { id: 'health',    name: 'Health',           color: '#b04a5e' },
    { id: 'fun',       name: 'Fun & Snacks',     color: '#c96a2e' },
    { id: 'cicilan',   name: 'Cicilan',          color: '#6b4f2a' },
    { id: 'clothing',  name: 'Clothing',         color: '#a34a7a' },
    { id: 'giving',    name: 'Arisan & Giving',  color: '#7a8a2e' }
  ];

  // [date, description, category, amount, kind] — kind is 'out' or 'in'.
  var SEED_TRANSACTIONS = [
    // --- November 2026: income ---
    ['2026-11-01', 'Toko Santoso — shop income', 'income', 6500000, 'in'],
    ['2026-11-08', 'Online sales (Ibu) — Shopee & WA', 'income', 1800000, 'in'],
    // --- November 2026: food & market ---
    ['2026-11-02', 'Pasar Minggu — vegetables & fish', 'food', 185000, 'out'],
    ['2026-11-03', 'Belanja harian — warung', 'food', 96000, 'out'],
    ['2026-11-05', 'Ayam & telur — pasar', 'food', 142000, 'out'],
    ['2026-11-06', 'Beras 10 kg', 'food', 128000, 'out'],
    ['2026-11-08', 'Sayur & buah', 'food', 87000, 'out'],
    ['2026-11-10', 'Indomaret — milk & bread', 'food', 64000, 'out'],
    ['2026-11-12', 'Pasar Minggu — vegetables & fish', 'food', 210000, 'out'],
    ['2026-11-14', 'Bakso keluarga — Saturday dinner', 'food', 95000, 'out'],
    ['2026-11-16', 'Belanja harian — warung', 'food', 110000, 'out'],
    ['2026-11-18', 'Ayam geprek — lunch', 'food', 78000, 'out'],
    ['2026-11-20', 'Pasar Minggu — vegetables & fish', 'food', 195000, 'out'],
    ['2026-11-22', 'Minyak goreng & bumbu dapur', 'food', 132000, 'out'],
    ['2026-11-24', 'Belanja harian — warung', 'food', 88000, 'out'],
    ['2026-11-26', 'Resto sederhana — family dinner', 'food', 240000, 'out'],
    // --- November 2026: transport ---
    ['2026-11-04', 'Bensin motor', 'transport', 50000, 'out'],
    ['2026-11-09', 'Bensin motor', 'transport', 55000, 'out'],
    ['2026-11-11', 'Parkir & tol — Yogyakarta trip', 'transport', 38000, 'out'],
    ['2026-11-15', 'Bensin motor', 'transport', 52000, 'out'],
    ['2026-11-18', 'Ojek anak — school run', 'transport', 40000, 'out'],
    ['2026-11-21', 'Bensin motor', 'transport', 58000, 'out'],
    ['2026-11-23', 'Servis motor — oil & brake', 'transport', 185000, 'out'],
    ['2026-11-26', 'Bensin motor', 'transport', 50000, 'out'],
    // --- November 2026: bills & internet ---
    ['2026-11-07', 'Listrik PLN', 'bills', 385000, 'out'],
    ['2026-11-07', 'Air PDAM', 'bills', 95000, 'out'],
    ['2026-11-10', 'Internet IndiHome', 'bills', 299000, 'out'],
    ['2026-11-12', 'Pulsa — both phones', 'bills', 50000, 'out'],
    ['2026-11-20', 'Token listrik top-up', 'bills', 120000, 'out'],
    // --- November 2026: school ---
    ['2026-11-05', 'SPP anak — November', 'school', 650000, 'out'],
    ['2026-11-09', 'Buku & alat tulis', 'school', 180000, 'out'],
    ['2026-11-12', 'Les piano — Dita', 'school', 250000, 'out'],
    ['2026-11-17', 'Seragam olahraga — Budi', 'school', 120000, 'out'],
    // --- November 2026: household ---
    ['2026-11-06', 'Sabun & deterjen', 'household', 85000, 'out'],
    ['2026-11-13', 'Gas LPG 3 kg', 'household', 28000, 'out'],
    ['2026-11-19', 'Peralatan dapur — wajan baru', 'household', 150000, 'out'],
    ['2026-11-25', 'Piring & gelas', 'household', 120000, 'out'],
    // --- November 2026: health ---
    ['2026-11-08', 'Obat flu — apotek', 'health', 65000, 'out'],
    ['2026-11-15', 'Vitamin keluarga', 'health', 110000, 'out'],
    ['2026-11-21', 'Periksa gigi — Budi', 'health', 150000, 'out'],
    // --- November 2026: fun & snacks ---
    ['2026-11-15', 'Nonton bioskop — family movie', 'fun', 120000, 'out'],
    ['2026-11-16', 'Jajan anak — kantin', 'fun', 45000, 'out'],
    ['2026-11-22', 'Es krim keluarga', 'fun', 60000, 'out'],
    ['2026-11-27', 'Mainan — birthday gift', 'fun', 90000, 'out'],
    // --- November 2026: installments, clothing, giving ---
    ['2026-11-10', 'Cicilan motor — angsuran ke-28', 'cicilan', 450000, 'out'],
    ['2026-11-19', 'Baju & sandal anak — pasar', 'clothing', 180000, 'out'],
    ['2026-11-03', 'Arisan RT — November', 'giving', 100000, 'out'],
    ['2026-11-07', 'Sedekah Jumat', 'giving', 50000, 'out'],
    // --- October 2026: income ---
    ['2026-10-01', 'Toko Santoso — shop income', 'income', 6400000, 'in'],
    ['2026-10-09', 'Online sales (Ibu) — Shopee & WA', 'income', 1700000, 'in'],
    // --- October 2026: spending ---
    ['2026-10-02', 'Pasar Minggu — vegetables & fish', 'food', 198000, 'out'],
    ['2026-10-04', 'Beras 10 kg', 'food', 126000, 'out'],
    ['2026-10-07', 'Belanja harian — warung', 'food', 104000, 'out'],
    ['2026-10-11', 'Pasar Minggu — vegetables & fish', 'food', 205000, 'out'],
    ['2026-10-14', 'Ayam & telur — pasar', 'food', 138000, 'out'],
    ['2026-10-18', 'Belanja harian — warung', 'food', 92000, 'out'],
    ['2026-10-21', 'Pasar Minggu — vegetables & fish', 'food', 188000, 'out'],
    ['2026-10-25', 'Soto & es teh — family lunch', 'food', 132000, 'out'],
    ['2026-10-28', 'Belanja harian — warung', 'food', 99000, 'out'],
    ['2026-10-03', 'Bensin motor', 'transport', 52000, 'out'],
    ['2026-10-10', 'Bensin motor', 'transport', 54000, 'out'],
    ['2026-10-17', 'Bensin motor', 'transport', 51000, 'out'],
    ['2026-10-24', 'Bensin motor', 'transport', 56000, 'out'],
    ['2026-10-06', 'Listrik PLN', 'bills', 372000, 'out'],
    ['2026-10-06', 'Air PDAM', 'bills', 92000, 'out'],
    ['2026-10-10', 'Internet IndiHome', 'bills', 299000, 'out'],
    ['2026-10-05', 'SPP anak — October', 'school', 650000, 'out'],
    ['2026-10-12', 'Les piano — Dita', 'school', 250000, 'out'],
    ['2026-10-15', 'Buku gambar & crayon', 'school', 95000, 'out'],
    ['2026-10-08', 'Sabun & deterjen', 'household', 78000, 'out'],
    ['2026-10-20', 'Gas LPG 3 kg', 'household', 28000, 'out'],
    ['2026-10-22', 'Handuk & lap dapur', 'household', 96000, 'out'],
    ['2026-10-13', 'Obat batuk — apotek', 'health', 58000, 'out'],
    ['2026-10-26', 'Vitamin keluarga', 'health', 104000, 'out'],
    ['2026-10-16', 'Jajan anak — kantin', 'fun', 52000, 'out'],
    ['2026-10-19', 'Nonton bioskop — family movie', 'fun', 115000, 'out'],
    ['2026-10-27', 'Es krim keluarga', 'fun', 55000, 'out'],
    // --- October 2026: installments, clothing, giving ---
    ['2026-10-10', 'Cicilan motor — angsuran ke-27', 'cicilan', 450000, 'out'],
    ['2026-10-24', 'Baju Ibu — pasar', 'clothing', 150000, 'out'],
    ['2026-10-03', 'Arisan RT — October', 'giving', 100000, 'out']
  ];

  var SEED_BUDGETS = {
    food: 2400000, transport: 800000, bills: 900000, school: 1200000,
    household: 600000, health: 500000, fun: 400000,
    cicilan: 500000, clothing: 300000, giving: 200000
  };

  // Each goal carries its funding history: [month, amount added].
  // The rows sum exactly to the goal's saved balance, so the balance
  // can always be traced back to real monthly savings.
  var SEED_GOALS = [
    { id: 'g1', name: 'Emergency fund', note: 'For sudden costs — hospital, repairs', target: 10000000, saved: 6250000,
      history: [['Before Jun 2026', 1000000], ['Jun 2026', 800000], ['Jul 2026', 800000], ['Aug 2026', 700000], ['Sep 2026', 800000], ['Oct 2026', 1500000], ['Nov 2026', 650000]] },
    { id: 'g2', name: 'New fridge', note: 'The old one leaks — replace before Lebaran', target: 4500000, saved: 2800000,
      history: [['Before Jun 2026', 500000], ['Jun 2026', 300000], ['Jul 2026', 400000], ['Aug 2026', 300000], ['Sep 2026', 300000], ['Oct 2026', 600000], ['Nov 2026', 400000]] },
    { id: 'g3', name: 'Family trip — Dieng', note: 'Two nights in the highlands with the kids', target: 3000000, saved: 900000,
      history: [['Before Jun 2026', 0], ['Jun 2026', 100000], ['Jul 2026', 150000], ['Aug 2026', 100000], ['Sep 2026', 150000], ['Oct 2026', 200000], ['Nov 2026', 200000]] }
  ];

  // Recurring monthly bills. A bill counts as paid when a transaction
  // whose description contains `match` exists in that month; marking one
  // paid adds exactly that transaction, so the ledger always agrees.
  var SEED_BILLS = [
    { id: 'b1', name: 'Arisan RT', amount: 100000, due: 3, cat: 'giving', match: 'Arisan RT' },
    { id: 'b2', name: 'SPP anak', amount: 650000, due: 5, cat: 'school', match: 'SPP anak' },
    { id: 'b3', name: 'Listrik PLN', amount: 385000, due: 7, cat: 'bills', match: 'Listrik PLN' },
    { id: 'b4', name: 'Air PDAM', amount: 95000, due: 7, cat: 'bills', match: 'Air PDAM' },
    { id: 'b5', name: 'Internet IndiHome', amount: 299000, due: 10, cat: 'bills', match: 'Internet IndiHome' },
    { id: 'b6', name: 'Cicilan motor', amount: 450000, due: 10, cat: 'cicilan', match: 'Cicilan motor' },
    { id: 'b7', name: 'Les piano — Dita', amount: 250000, due: 12, cat: 'school', match: 'Les piano' },
    { id: 'b8', name: 'Pulsa — both phones', amount: 50000, due: 12, cat: 'bills', match: 'Pulsa' },
    { id: 'b9', name: 'Iuran sampah RT', amount: 25000, due: 25, cat: 'household', match: 'Iuran sampah RT' }
  ];

  // The one loan the family is still paying off.
  var SEED_DEBT = {
    name: 'Motorbike loan — Honda Beat', total: 18000000, installment: 450000,
    paidCount: 28, termMonths: 40,
    note: 'Started Aug 2024, Rp 450.000 a month. 28 of 40 payments made — 12 to go, done Oct 2027.'
  };

  // "Today" for the site's figures — the last day with real transactions.
  var TODAY = '2026-11-27';

  // Monthly aggregates for June–September (full transactions kept for Oct + Nov).
  var SEED_TREND = [
    { month: 'Jun 2026', income: 7900000, spent: 5410000 },
    { month: 'Jul 2026', income: 8100000, spent: 5680000 },
    { month: 'Aug 2026', income: 8050000, spent: 5920000 },
    { month: 'Sep 2026', income: 8200000, spent: 5760000 }
  ];

  var STORE_KEY = 'dompet-keluarga-v1';

  function freshState() {
    var txs = SEED_TRANSACTIONS.map(function (t, i) {
      return { id: 't' + (i + 1), date: t[0], desc: t[1], cat: t[2], amount: t[3], kind: t[4] };
    });
    var budgets = {};
    Object.keys(SEED_BUDGETS).forEach(function (k) { budgets[k] = SEED_BUDGETS[k]; });
    var goals = SEED_GOALS.map(function (g) {
      return { id: g.id, name: g.name, note: g.note, target: g.target, saved: g.saved,
        history: g.history.map(function (h) { return [h[0], h[1]]; }) };
    });
    return { transactions: txs, budgets: budgets, goals: goals, nextId: txs.length + 1, nextGoal: 4 };
  }

  // Attach seed funding histories to goals loaded from an older save.
  function normaliseGoals(state) {
    state.goals.forEach(function (g) {
      if (!g.history) {
        SEED_GOALS.forEach(function (sg) {
          if (sg.id === g.id) g.history = sg.history.map(function (h) { return [h[0], h[1]]; });
        });
        if (!g.history) g.history = [];
      }
    });
    return state;
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.transactions && parsed.budgets && parsed.goals) return normaliseGoals(parsed);
      }
    } catch (e) { /* storage unavailable: fall through to seed */ }
    return freshState();
  }

  function saveState(state) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function resetState() {
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    return freshState();
  }

  function monthOf(dateStr) { return dateStr.slice(0, 7); } // '2026-11'

  function monthLabel(ym) {
    var parts = ym.split('-');
    var names = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    return names[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  function monthTx(state, ym) {
    return state.transactions.filter(function (t) { return monthOf(t.date) === ym; });
  }

  function monthTotals(state, ym) {
    var income = 0, spent = 0;
    monthTx(state, ym).forEach(function (t) {
      if (t.kind === 'in') income += t.amount; else spent += t.amount;
    });
    return { income: income, spent: spent, saved: income - spent };
  }

  function categorySpent(state, ym) {
    var out = {};
    CATEGORIES.forEach(function (c) { out[c.id] = 0; });
    monthTx(state, ym).forEach(function (t) {
      if (t.kind === 'out' && out.hasOwnProperty(t.cat)) out[t.cat] += t.amount;
    });
    return out;
  }

  function categoryById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i];
    return { id: id, name: id, color: '#888888' };
  }

  function fmt(n) {
    return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function fmtShort(n) {
    if (n >= 1000000) return 'Rp ' + (Math.round(n / 100000) / 10) + ' jt';
    if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
    return fmt(n);
  }

  function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }

  function trendSeries(state) {
    var series = SEED_TREND.map(function (r) {
      return { month: r.month, income: r.income, spent: r.spent };
    });
    ['2026-10', '2026-11'].forEach(function (ym) {
      var t = monthTotals(state, ym);
      series.push({ month: monthLabel(ym), income: t.income, spent: t.spent });
    });
    return series;
  }

  function daysInMonth(ym) {
    var parts = ym.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10), 0).getDate();
  }

  // Days still to spend in a month: only the current month has any left.
  function daysLeft(ym) {
    if (ym !== TODAY.slice(0, 7)) return 0;
    return Math.max(0, daysInMonth(ym) - parseInt(TODAY.slice(8, 10), 10));
  }

  // Safe to spend per day: unspent budget divided by the days left.
  function safeSpend(state, ym) {
    var byCat = categorySpent(state, ym);
    var totalBudget = 0, spent = 0;
    CATEGORIES.forEach(function (c) {
      totalBudget += state.budgets[c.id] || 0;
      spent += byCat[c.id];
    });
    var left = daysLeft(ym);
    return {
      totalBudget: totalBudget, spent: spent, remaining: totalBudget - spent,
      daysLeft: left, perDay: left > 0 ? Math.floor((totalBudget - spent) / left) : 0
    };
  }

  // 50/30/20 check: needs = food, transport, bills, school, household,
  // health, installments; wants = fun, clothing, giving; save = what's left.
  var NEEDS = ['food', 'transport', 'bills', 'school', 'household', 'health', 'cicilan'];
  var WANTS = ['fun', 'clothing', 'giving'];

  function fiftyThirtyTwenty(state, ym) {
    var byCat = categorySpent(state, ym);
    var t = monthTotals(state, ym);
    var needs = 0, wants = 0;
    NEEDS.forEach(function (c) { needs += byCat[c] || 0; });
    WANTS.forEach(function (c) { wants += byCat[c] || 0; });
    return {
      needs: needs, wants: wants, saved: t.saved, income: t.income,
      needsPct: pct(needs, t.income), wantsPct: pct(wants, t.income), savedPct: pct(t.saved, t.income)
    };
  }

  // Recurring bills with paid/pending status for a month.
  function billsFor(state, ym) {
    var txs = monthTx(state, ym);
    return SEED_BILLS.map(function (b) {
      var paidTx = null;
      if (b.match) {
        txs.forEach(function (t) {
          if (t.kind === 'out' && t.desc.indexOf(b.match) !== -1) paidTx = t;
        });
      }
      return { id: b.id, name: b.name, amount: b.amount, due: b.due, cat: b.cat,
        match: b.match, paid: !!paidTx, paidTx: paidTx };
    });
  }

  function debtInfo() {
    var d = SEED_DEBT;
    return { name: d.name, total: d.total, installment: d.installment,
      paidCount: d.paidCount, termMonths: d.termMonths, note: d.note,
      paid: d.installment * d.paidCount, remaining: d.total - d.installment * d.paidCount,
      remainingCount: d.termMonths - d.paidCount };
  }

  function goalHistorySum(g) {
    if (!g.history) return 0;
    return g.history.reduce(function (a, h) { return a + h[1]; }, 0);
  }

  // Spending per calendar day of a month: one entry per day, expenses only.
  function dailySpend(state, ym) {
    var days = daysInMonth(ym);
    var out = [];
    for (var d = 1; d <= days; d++) out.push({ day: d, spent: 0, count: 0 });
    monthTx(state, ym).forEach(function (t) {
      if (t.kind !== 'out') return;
      var i = parseInt(t.date.slice(8, 10), 10) - 1;
      if (i >= 0 && i < out.length) { out[i].spent += t.amount; out[i].count++; }
    });
    return out;
  }

  // Spending per week of a month: days 1-7, 8-14, 15-21, 22-28, 29-end.
  function weeklySpend(state, ym) {
    var days = dailySpend(state, ym);
    var ranges = [[1, 7], [8, 14], [15, 21], [22, 28], [29, days.length]];
    return ranges.map(function (r) {
      var spent = 0, count = 0;
      days.forEach(function (d) {
        if (d.day >= r[0] && d.day <= r[1]) { spent += d.spent; count += d.count; }
      });
      var mon = monthLabel(ym).split(' ')[0].slice(0, 3);
      return { label: r[0] + '–' + r[1] + ' ' + mon, spent: spent, count: count };
    });
  }

  // The month's pace: what the family spends a day so far, and where the
  // month lands if it keeps going at that pace. Only the current month
  // (the one TODAY sits in) has days elapsed; a closed month projects
  // from its own full length.
  function pace(state, ym) {
    var t = monthTotals(state, ym);
    var totalBudget = 0;
    CATEGORIES.forEach(function (c) { totalBudget += state.budgets[c.id] || 0; });
    var days = daysInMonth(ym);
    var elapsed = ym === TODAY.slice(0, 7) ? parseInt(TODAY.slice(8, 10), 10) : days;
    var avg = elapsed > 0 ? Math.floor(t.spent / elapsed) : 0;
    var projected = avg * days;
    return {
      elapsed: elapsed, days: days, avgPerDay: avg,
      projectedSpent: projected, projectedSaved: t.income - projected,
      totalBudget: totalBudget, onTrack: projected <= totalBudget
    };
  }

  // The single biggest purchase of a month (expenses only).
  function biggestPurchase(state, ym) {
    var best = null;
    monthTx(state, ym).forEach(function (t) {
      if (t.kind === 'out' && (!best || t.amount > best.amount)) best = t;
    });
    return best;
  }

  // The busiest spending day of a month.
  function busiestDay(state, ym) {
    var days = dailySpend(state, ym);
    var best = days[0];
    days.forEach(function (d) { if (d.spent > best.spent) best = d; });
    return best;
  }

  // Month label n months after a 'YYYY-MM' month, e.g. ('2026-11', 8) -> 'Jul 2027'.
  function monthAddLabel(ym, n) {
    var parts = ym.split('-');
    var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1 + n;
    y += Math.floor(m / 12); m = m % 12;
    var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[m] + ' ' + y;
  }

  // Goal planner: how many months until a goal is reached at a fixed
  // monthly contribution, and which month that lands in.
  function goalPlan(goal, monthly) {
    var remaining = Math.max(0, goal.target - goal.saved);
    if (remaining <= 0) return { remaining: 0, months: 0, finish: 'already reached' };
    if (!monthly || monthly <= 0) return { remaining: remaining, months: null, finish: null };
    var months = Math.ceil(remaining / monthly);
    return { remaining: remaining, months: months, finish: monthAddLabel('2026-11', months) };
  }

  // What-if planner: to save targetPct% of this month's income, how much
  // may the family spend in total, how much must spending fall, and which
  // categories would carry the cut if it were spread in proportion to
  // what each category spends now.
  function whatIf(state, ym, targetPct) {
    var t = monthTotals(state, ym);
    var byCat = categorySpent(state, ym);
    var allowed = Math.round(t.income * (100 - targetPct) / 100);
    var cut = t.spent - allowed;
    var cuts = [];
    if (cut > 0 && t.spent > 0) {
      cuts = CATEGORIES.map(function (c) {
        return { name: c.name, spent: byCat[c.id], cut: Math.round(cut * byCat[c.id] / t.spent) };
      }).filter(function (r) { return r.cut > 0; })
        .sort(function (a, b) { return b.cut - a.cut; }).slice(0, 3);
    }
    return { income: t.income, spent: t.spent, targetPct: targetPct,
      allowedSpend: allowed, cutNeeded: cut, cuts: cuts };
  }

  window.BudgetData = {
    CATEGORIES: CATEGORIES, SEED_TREND: SEED_TREND, SEED_DEBT: SEED_DEBT, TODAY: TODAY,
    loadState: loadState, saveState: saveState, resetState: resetState,
    monthOf: monthOf, monthLabel: monthLabel, monthTx: monthTx,
    monthTotals: monthTotals, categorySpent: categorySpent,
    categoryById: categoryById, fmt: fmt, fmtShort: fmtShort, pct: pct,
    trendSeries: trendSeries, daysLeft: daysLeft, safeSpend: safeSpend,
    fiftyThirtyTwenty: fiftyThirtyTwenty, billsFor: billsFor,
    debtInfo: debtInfo, goalHistorySum: goalHistorySum,
    dailySpend: dailySpend, weeklySpend: weeklySpend, pace: pace,
    biggestPurchase: biggestPurchase, busiestDay: busiestDay,
    monthAddLabel: monthAddLabel, goalPlan: goalPlan, whatIf: whatIf
  };
})();
