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
    { id: 'fun',       name: 'Fun & Snacks',     color: '#c96a2e' }
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
    ['2026-11-28', 'Pasar Minggu — vegetables & fish', 'food', 175000, 'out'],
    ['2026-11-29', 'Snack anak — jajan', 'food', 45000, 'out'],
    // --- November 2026: transport ---
    ['2026-11-04', 'Bensin motor', 'transport', 50000, 'out'],
    ['2026-11-09', 'Bensin motor', 'transport', 55000, 'out'],
    ['2026-11-11', 'Parkir & tol — Yogyakarta trip', 'transport', 38000, 'out'],
    ['2026-11-15', 'Bensin motor', 'transport', 52000, 'out'],
    ['2026-11-18', 'Ojek anak — school run', 'transport', 40000, 'out'],
    ['2026-11-21', 'Bensin motor', 'transport', 58000, 'out'],
    ['2026-11-23', 'Servis motor — oil & brake', 'transport', 185000, 'out'],
    ['2026-11-26', 'Bensin motor', 'transport', 50000, 'out'],
    ['2026-11-28', 'Parkir — mall', 'transport', 32000, 'out'],
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
    ['2026-10-27', 'Es krim keluarga', 'fun', 55000, 'out']
  ];

  var SEED_BUDGETS = {
    food: 2400000, transport: 800000, bills: 900000, school: 1200000,
    household: 600000, health: 500000, fun: 400000
  };

  var SEED_GOALS = [
    { id: 'g1', name: 'Emergency fund', note: 'For sudden costs — hospital, repairs', target: 10000000, saved: 6250000 },
    { id: 'g2', name: 'New fridge', note: 'The old one leaks — replace before Lebaran', target: 4500000, saved: 2800000 },
    { id: 'g3', name: 'Family trip — Dieng', note: 'Two nights in the highlands with the kids', target: 3000000, saved: 900000 }
  ];

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
      return { id: g.id, name: g.name, note: g.note, target: g.target, saved: g.saved };
    });
    return { transactions: txs, budgets: budgets, goals: goals, nextId: txs.length + 1, nextGoal: 4 };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.transactions && parsed.budgets && parsed.goals) return parsed;
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

  window.BudgetData = {
    CATEGORIES: CATEGORIES, SEED_TREND: SEED_TREND,
    loadState: loadState, saveState: saveState, resetState: resetState,
    monthOf: monthOf, monthLabel: monthLabel, monthTx: monthTx,
    monthTotals: monthTotals, categorySpent: categorySpent,
    categoryById: categoryById, fmt: fmt, fmtShort: fmtShort, pct: pct,
    trendSeries: trendSeries
  };
})();
