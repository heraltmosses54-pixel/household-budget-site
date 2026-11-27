// views.js — one render function per page. Each returns an HTML string;
// app.js drops it into #view and wires the controls. Every number shown
// is computed live from the state in data.js — nothing is hard-coded.

(function () {
  'use strict';

  var D = window.BudgetData;
  var C = window.BudgetCharts;
  var esc = C.esc;

  function monthNav(state, ym) {
    var months = ['2026-10', '2026-11'];
    var i = months.indexOf(ym);
    var prev = i > 0 ? '<button class="mnbtn" data-action="month-prev" aria-label="Previous month">‹ Prev</button>' : '<button class="mnbtn" disabled>‹ Prev</button>';
    var next = i < months.length - 1 ? '<button class="mnbtn" data-action="month-next" aria-label="Next month">Next ›</button>' : '<button class="mnbtn" disabled>Next ›</button>';
    return '<div class="monthnav">' + prev + '<strong>' + D.monthLabel(ym) + '</strong>' + next + '</div>';
  }

  function statCard(label, value, sub, tone) {
    return '<div class="stat ' + (tone || '') + '"><div class="stat-label">' + esc(label) + '</div>' +
      '<div class="stat-value">' + esc(value) + '</div><div class="stat-sub">' + esc(sub) + '</div></div>';
  }

  function progressBar(pct, tone) {
    return '<div class="pbar"><div class="pfill ' + (tone || '') + '" style="width:' + Math.min(100, pct) + '%"></div></div>';
  }

  function toneFor(pct) { return pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok'; }

  function dashboard(state, ym) {
    var t = D.monthTotals(state, ym);
    var byCat = D.categorySpent(state, ym);
    var rate = D.pct(t.saved, t.income);
    var totalBudget = 0;
    D.CATEGORIES.forEach(function (c) { totalBudget += state.budgets[c.id] || 0; });
    var budgetPct = D.pct(t.spent, totalBudget);

    var segs = D.CATEGORIES.map(function (c) { return { value: byCat[c.id], color: c.color, name: c.name }; });
    var donut = C.donut(segs, 180, 26);

    var top = D.CATEGORIES.map(function (c) { return { c: c, v: byCat[c.id] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 4);

    var recent = D.monthTx(state, ym).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 6);
    var recentRows = recent.map(function (tx) {
      var cat = tx.kind === 'in' ? { name: 'Income', color: '#2e7d5b' } : D.categoryById(tx.cat);
      return '<li><span class="tx-date">' + tx.date.slice(5) + '</span>' +
        '<span class="tx-desc">' + esc(tx.desc) + '</span>' +
        '<span class="chip" style="background:' + cat.color + '1a;color:' + cat.color + '">' + esc(cat.name) + '</span>' +
        '<span class="tx-amt ' + tx.kind + '">' + (tx.kind === 'in' ? '+' : '−') + D.fmt(tx.amount) + '</span></li>';
    }).join('');

    var goalRows = state.goals.map(function (g) {
      var p = D.pct(g.saved, g.target);
      return '<div class="goal-mini"><div class="goal-mini-head"><strong>' + esc(g.name) + '</strong>' +
        '<span>' + D.fmt(g.saved) + ' / ' + D.fmt(g.target) + ' · ' + p + '%</span></div>' +
        progressBar(p, toneFor(p)) + '</div>';
    }).join('');

    var catOpts = D.CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('');

    return '<section class="hero">' +
      '<div><h1>Good evening, Santoso family</h1>' +
      '<p class="lede">Here is where the household money stands in ' + D.monthLabel(ym) +
      ' — what came in, what went out, and what is left for the goals.</p></div>' +
      monthNav(state, ym) + '</section>' +

      '<div class="stats">' +
      statCard('Income', D.fmt(t.income), 'Shop + online sales', 'green') +
      statCard('Spent', D.fmt(t.spent), 'Across ' + D.monthTx(state, ym).filter(function (x) { return x.kind === 'out'; }).length + ' purchases', 'orange') +
      statCard('Saved', D.fmt(t.saved), rate + '% of income kept', 'green') +
      '</div>' +

      '<div class="grid2">' +
      '<div class="card"><h2>Where the money went</h2>' +
      '<div class="donut-wrap">' + donut +
      '<div class="donut-centre"><strong>' + D.fmt(t.spent) + '</strong><span>spent in ' + D.monthLabel(ym) + '</span></div></div>' +
      '<ul class="legend">' + top.map(function (x) {
        return '<li><span class="dot" style="background:' + x.c.color + '"></span>' + esc(x.c.name) +
          '<b>' + D.fmt(x.v) + '</b><span class="muted">' + D.pct(x.v, t.spent) + '%</span></li>';
      }).join('') + '</ul>' +
      '<p class="cardlink"><a href="#/transactions">See every transaction →</a></p></div>' +

      '<div class="card"><h2>Budget health</h2>' +
      '<p class="bignum">' + D.fmt(t.spent) + ' <span class="muted">of ' + D.fmt(totalBudget) + ' budgeted</span></p>' +
      progressBar(budgetPct, toneFor(budgetPct)) +
      '<p class="muted">' + budgetPct + '% of the monthly budget used · ' +
      (t.spent <= totalBudget ? D.fmt(totalBudget - t.spent) + ' still free' : D.fmt(t.spent - totalBudget) + ' over budget') + '</p>' +
      '<h3 class="subhead">Savings goals</h3>' + goalRows +
      '<p class="cardlink"><a href="#/goals">Open savings goals →</a></p></div>' +
      '</div>' +

      '<div class="grid2">' +
      '<div class="card"><h2>Recent spending</h2><ul class="txlist">' + recentRows + '</ul>' +
      '<p class="cardlink"><a href="#/transactions">All transactions →</a></p></div>' +

      '<div class="card"><h2>Quick add</h2>' +
      '<p class="muted">Bought something? Log it in seconds — totals and charts update at once.</p>' +
      '<form id="quick-add" class="form-grid">' +
      '<label>Date<input type="date" name="date" value="' + ym + '-27" required></label>' +
      '<label>What was it?<input type="text" name="desc" placeholder="e.g. Pasar Minggu" required maxlength="80"></label>' +
      '<label>Category<select name="cat">' + catOpts + '</select></label>' +
      '<label>Amount (Rp)<input type="number" name="amount" min="1000" step="500" placeholder="150000" required></label>' +
      '<button type="submit" class="btn">Add expense</button>' +
      '</form><p class="form-note" id="quick-note" role="status"></p></div>' +
      '</div>';
  }

  function transactions(state, ym, filter) {
    var txs = D.monthTx(state, ym).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var shown = txs;
    if (filter === 'in') shown = txs.filter(function (t) { return t.kind === 'in'; });
    else if (filter && filter !== 'all') shown = txs.filter(function (t) { return t.kind === 'out' && t.cat === filter; });
    var t = D.monthTotals(state, ym);
    var chips = '<button class="chipbtn' + (filter === 'all' ? ' on' : '') + '" data-action="filter" data-filter="all">All</button>' +
      '<button class="chipbtn' + (filter === 'in' ? ' on' : '') + '" data-action="filter" data-filter="in">Income</button>' +
      D.CATEGORIES.map(function (c) {
        return '<button class="chipbtn' + (filter === c.id ? ' on' : '') + '" data-action="filter" data-filter="' + c.id + '">' + esc(c.name) + '</button>';
      }).join('');

    var rows = shown.map(function (tx) {
      var cat = tx.kind === 'in' ? { name: 'Income', color: '#2e7d5b' } : D.categoryById(tx.cat);
      return '<tr data-id="' + tx.id + '">' +
        '<td class="c-date">' + tx.date + '</td>' +
        '<td>' + esc(tx.desc) + '</td>' +
        '<td><span class="chip" style="background:' + cat.color + '1a;color:' + cat.color + '">' + esc(cat.name) + '</span></td>' +
        '<td class="c-amt ' + tx.kind + '">' + (tx.kind === 'in' ? '+' : '−') + D.fmt(tx.amount) + '</td>' +
        '<td class="c-act"><button class="mini" data-action="tx-edit" data-id="' + tx.id + '">Edit</button> ' +
        '<button class="mini danger" data-action="tx-del" data-id="' + tx.id + '">Delete</button></td></tr>';
    }).join('');

    var catOpts = D.CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('');

    return '<section class="hero"><div><h1>Transactions</h1>' +
      '<p class="lede">Every rupiah in and out of the house in ' + D.monthLabel(ym) +
      '. Add, fix or remove anything — the dashboard, budgets and reports follow.</p></div>' +
      monthNav(state, ym) + '</section>' +
      '<div class="stats">' +
      statCard('Income', D.fmt(t.income), '2 paydays this month', 'green') +
      statCard('Spent', D.fmt(t.spent), shown.length + ' of ' + txs.length + ' rows shown', 'orange') +
      statCard('Saved', D.fmt(t.saved), D.pct(t.saved, t.income) + '% of income kept', 'green') +
      '</div>' +
      '<div class="card"><h2>All transactions</h2><div class="chips">' + chips + '</div>' +
      '<div class="tablewrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="c-amt">Amount</th><th></th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="5" class="muted">Nothing here yet — add the first one below.</td></tr>') + '</tbody></table></div></div>' +
      '<div class="card"><h2>Add a transaction</h2>' +
      '<form id="tx-add" class="form-grid wide">' +
      '<label>Date<input type="date" name="date" value="' + ym + '-27" required></label>' +
      '<label>Description<input type="text" name="desc" placeholder="e.g. Bensin motor" required maxlength="80"></label>' +
      '<label>Category<select name="cat">' + catOpts + '</select></label>' +
      '<label>Amount (Rp)<input type="number" name="amount" min="1000" step="500" placeholder="50000" required></label>' +
      '<label>Type<select name="kind"><option value="out">Expense</option><option value="in">Income</option></select></label>' +
      '<button type="submit" class="btn">Add transaction</button>' +
      '</form><p class="form-note" id="tx-note" role="status"></p></div>';
  }

  function budgets(state, ym) {
    var byCat = D.categorySpent(state, ym);
    var totalBudget = 0, totalSpent = 0;
    D.CATEGORIES.forEach(function (c) { totalBudget += state.budgets[c.id] || 0; totalSpent += byCat[c.id]; });
    var cards = D.CATEGORIES.map(function (c) {
      var spent = byCat[c.id], budget = state.budgets[c.id] || 0;
      var p = D.pct(spent, budget), tone = toneFor(p);
      var status = p >= 100 ? '<span class="flag over">Over by ' + D.fmt(spent - budget) + '</span>'
        : p >= 80 ? '<span class="flag warn">Almost full — ' + D.fmt(budget - spent) + ' left</span>'
        : '<span class="flag ok">' + D.fmt(budget - spent) + ' left</span>';
      return '<div class="card budget-card"><div class="budget-head"><h3><span class="dot" style="background:' + c.color + '"></span>' +
        esc(c.name) + '</h3><span class="budget-pct ' + tone + '">' + p + '%</span></div>' +
        '<p class="bignum">' + D.fmt(spent) + ' <span class="muted">/ ' + D.fmt(budget) + '</span></p>' +
        progressBar(p, tone) + '<p class="muted">' + status + '</p>' +
        '<form class="budget-edit" data-cat="' + c.id + '"><label>Monthly limit (Rp) ' +
        '<input type="number" name="budget" min="0" step="10000" value="' + budget + '" required></label>' +
        '<button type="submit" class="btn small">Save limit</button></form></div>';
    }).join('');

    var over = D.CATEGORIES.filter(function (c) { return byCat[c.id] > (state.budgets[c.id] || 0); });
    var tip = over.length
      ? '<strong>Watch out:</strong> ' + over.map(function (c) { return esc(c.name); }).join(', ') +
        (over.length > 1 ? ' are' : ' is') + ' over budget this month. ' +
        'The extra token listrik top-up on 20 Nov pushed Bills over — trim next week’s market run by ' +
        D.fmt(over.reduce(function (a, c) { return a + byCat[c.id] - (state.budgets[c.id] || 0); }, 0)) + ' to get back on track.'
      : '<strong>On track:</strong> every category is inside its limit. Keep the market runs under ' +
        D.fmt(state.budgets.food / 4) + ' a week and the month ends with money to spare.';

    return '<section class="hero"><div><h1>Monthly budgets</h1>' +
      '<p class="lede">One limit per category, set at the start of the month. Change a limit any time — the bars and the dashboard move with it.</p></div>' +
      monthNav(state, ym) + '</section>' +
      '<div class="stats">' +
      statCard('Total budget', D.fmt(totalBudget), 'All 7 categories', '') +
      statCard('Spent so far', D.fmt(totalSpent), D.pct(totalSpent, totalBudget) + '% of the budget used', totalSpent > totalBudget ? 'orange' : 'green') +
      statCard('Still free', D.fmt(Math.max(0, totalBudget - totalSpent)), totalSpent > totalBudget ? 'Over budget this month' : 'Left to spend', totalSpent > totalBudget ? 'orange' : 'green') +
      '</div>' +
      '<div class="card tip">' + tip + '</div>' +
      '<div class="grid2">' + cards + '</div>' +
      '<p class="form-note" id="budget-note" role="status"></p>';
  }

  function goals(state) {
    var series = D.trendSeries(state);
    var avgSaved = 0;
    if (series.length) {
      avgSaved = series.reduce(function (a, s) { return a + (s.income - s.spent); }, 0) / series.length;
    }
    var cards = state.goals.map(function (g) {
      var p = D.pct(g.saved, g.target);
      var left = Math.max(0, g.target - g.saved);
      var months = left <= 0 ? 0 : avgSaved > 0 ? Math.ceil(left / avgSaved) : null;
      var eta = left <= 0 ? 'Reached — time to celebrate, then pick the next goal.'
        : months !== null ? 'About ' + months + ' month' + (months > 1 ? 's' : '') + ' to go at the current saving pace (' + D.fmt(Math.round(avgSaved)) + ' / month).'
        : 'Add a monthly contribution to see the finish date.';
      return '<div class="card goal-card"><div class="goal-head"><h3>' + esc(g.name) + '</h3>' +
        '<span class="goal-pct">' + p + '%</span></div>' +
        '<p class="muted">' + esc(g.note) + '</p>' +
        '<p class="bignum">' + D.fmt(g.saved) + ' <span class="muted">of ' + D.fmt(g.target) + '</span></p>' +
        progressBar(p, toneFor(p)) +
        '<p class="muted">' + esc(eta) + '</p>' +
        '<form class="goal-add" data-goal="' + g.id + '">' +
        '<button type="button" class="btn small ghost" data-action="goal-add" data-goal="' + g.id + '" data-amount="100000">+ Rp 100.000</button>' +
        '<label>Custom<input type="number" name="amount" min="1000" step="1000" placeholder="250000"></label>' +
        '<button type="submit" class="btn small">Add money</button></form></div>';
    }).join('');

    return '<section class="hero"><div><h1>Savings goals</h1>' +
      '<p class="lede">Three things the family is saving for. Every rupiah saved this month — ' +
      D.fmt(D.monthTotals(state, '2026-11').saved) + ' in November — can go to one of them.</p></div></section>' +
      '<div class="grid2">' + cards + '</div>' +
      '<div class="card"><h2>Start a new goal</h2>' +
      '<form id="goal-new" class="form-grid wide">' +
      '<label>Goal name<input type="text" name="name" placeholder="e.g. New motorbike" required maxlength="60"></label>' +
      '<label>Why this goal?<input type="text" name="note" placeholder="e.g. The old one is ten years old" maxlength="90"></label>' +
      '<label>Target (Rp)<input type="number" name="target" min="100000" step="50000" placeholder="5000000" required></label>' +
      '<label>Already saved (Rp)<input type="number" name="saved" min="0" step="50000" value="0"></label>' +
      '<button type="submit" class="btn">Add goal</button>' +
      '</form><p class="form-note" id="goal-note" role="status"></p></div>';
  }

  function reports(state, ym) {
    var series = D.trendSeries(state);
    var byCat = D.categorySpent(state, ym);
    var t = D.monthTotals(state, ym);
    var prev = D.monthTotals(state, '2026-10');
    var rows = D.CATEGORIES.map(function (c) {
      return { name: c.name, color: c.color, spent: byCat[c.id], budget: state.budgets[c.id] || 0 };
    }).sort(function (a, b) { return b.spent - a.spent; });
    var top = rows[0];
    var over = rows.filter(function (r) { return r.spent > r.budget; });
    var rate = D.pct(t.saved, t.income), prevRate = D.pct(prev.saved, prev.income);
    var best = series.slice().sort(function (a, b) { return (b.income - b.spent) - (a.income - a.spent); })[0];
    var insights = [
      '<strong>' + esc(top.name) + '</strong> is the biggest spend at ' + D.fmt(top.spent) +
      ' — ' + D.pct(top.spent, t.spent) + '% of everything the family spent in ' + D.monthLabel(ym) + '.',
      over.length
        ? '<strong>Over budget:</strong> ' + over.map(function (r) { return esc(r.name) + ' (' + D.fmt(r.spent - r.budget) + ' over)'; }).join(', ') + '.'
        : '<strong>No category is over budget</strong> this month — the limits are holding.',
      'Savings rate is <strong>' + rate + '%</strong>, ' +
      (rate >= prevRate ? 'up from ' + prevRate + '% in October — the family kept more this month.'
        : 'down from ' + prevRate + '% in October — the extra market runs and the motor service ate the difference.'),
      '<strong>' + esc(best.month) + '</strong> was the best saving month so far: ' +
      D.fmt(best.income - best.spent) + ' kept from ' + D.fmt(best.income) + ' of income.'
    ];

    return '<section class="hero"><div><h1>Reports</h1>' +
      '<p class="lede">Six months of the household in two charts — income against spending, and where ' +
      D.monthLabel(ym) + '’s money actually went.</p></div>' +
      monthNav(state, ym) + '</section>' +
      '<div class="grid2">' +
      '<div class="card"><h2>Income vs spending — last 6 months</h2>' +
      C.monthBars(series, 640, 260) +
      '<p class="legend-line"><span class="dot" style="background:#2e7d5b"></span>Income &nbsp; <span class="dot" style="background:#c96a2e"></span>Spent</p></div>' +
      '<div class="card"><h2>What we learned</h2><ul class="insights">' +
      insights.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>' +
      '</div>' +
      '<div class="card"><h2>Spending by category — ' + D.monthLabel(ym) + '</h2>' +
      C.categoryBars(rows) +
      '<p class="muted">Dark bar = spent, light bar = monthly limit. A red bar means the category went over its limit.</p></div>';
  }

  window.BudgetViews = { dashboard: dashboard, transactions: transactions, budgets: budgets, goals: goals, reports: reports };
})();
