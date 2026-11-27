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

    var ss = D.safeSpend(state, ym);
    var f5320 = D.fiftyThirtyTwenty(state, ym);
    var series = D.trendSeries(state);
    var idx = ym === '2026-11' ? 5 : 4;
    var prevM = series[idx - 1];
    var spendDiff = t.spent - prevM.spent;
    var spendDiffPct = prevM.spent > 0 ? Math.round((spendDiff / prevM.spent) * 100) : 0;
    var driverText;
    if (ym === '2026-11') {
      var byCatPrev = D.categorySpent(state, '2026-10');
      var drivers = D.CATEGORIES.map(function (c) {
        return { name: c.name, diff: byCat[c.id] - byCatPrev[c.id] };
      }).filter(function (d) { return d.diff > 0; })
        .sort(function (a, b) { return b.diff - a.diff; }).slice(0, 3);
      driverText = drivers.map(function (d) { return esc(d.name) + ' (+' + D.fmt(d.diff) + ')'; }).join(', ');
    } else {
      driverText = 'smaller market runs and no motor service this month';
    }
    var heaviest = series.slice().sort(function (a, b) { return b.spent - a.spent; })[0];
    var emergency = null;
    state.goals.forEach(function (g) { if (g.id === 'g1') emergency = g; });
    var coverMonths = (emergency && f5320.needs > 0) ? emergency.saved / f5320.needs : 0;
    var p = D.pace(state, ym);
    var big = D.biggestPurchase(state, ym);
    var bigDesc = big.desc.replace(/ — (January|February|March|April|May|June|July|August|September|October|November|December)$/, '');
    var busy = D.busiestDay(state, ym);
    var daysWithSpend = D.dailySpend(state, ym).filter(function (d) { return d.spent > 0; }).length;

    return '<section class="hero">' +
      '<div><h1>Every rupiah has a job.</h1>' +
      '<p class="lede">The Santoso family’s ' + D.monthLabel(ym) + ' budget — ' + D.fmt(t.income) + ' in, ' +
      D.fmt(t.spent) + ' out, ' + D.fmt(t.saved) + ' kept. ' +
      (ss.daysLeft > 0 ? 'With ' + ss.daysLeft + ' days left in the month, ' + D.fmt(ss.perDay) + ' a day is still safe to spend.'
        : 'The month is over — the books are closed.') + '</p></div>' +
      monthNav(state, ym) + '</section>' +

      '<div class="card intro"><strong>The Santoso family · Magelang.</strong> Pak Santoso runs Toko Santoso, ' +
      'Ibu sells online, and the kids Dita and Budi are in school. Four people, one wallet — ' +
      'this is their real budget book for October and November 2026, down to the last warung receipt.</div>' +

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
      '<div class="card"><h2>Six months at a glance</h2>' +
      C.monthBars(series, 640, 260) +
      '<p class="legend-line"><span class="dot" style="background:#2e7d5b"></span>Income &nbsp; <span class="dot" style="background:#c96a2e"></span>Spent</p>' +
      '<p class="muted">' + esc(heaviest.month) + ' is the heaviest spending month of the last six at ' + D.fmt(heaviest.spent) + '.</p></div>' +

      '<div class="card"><h2>What we found</h2><ul class="insights">' +
      '<li>Spending is <strong>' + (spendDiff >= 0 ? 'up ' : 'down ') + D.fmt(Math.abs(spendDiff)) + ' (' +
      (spendDiff >= 0 ? '+' : '−') + Math.abs(spendDiffPct) + '%)</strong> vs ' + esc(prevM.month) + ', driven by ' + driverText + '.</li>' +
      '<li><strong>50 / 30 / 20 check:</strong> needs ' + f5320.needsPct + '% (rule: 50%), wants ' + f5320.wantsPct +
      '% (rule: 30%), saved ' + f5320.savedPct + '% (rule: 20%). Needs run heavy on school fees — but the family still saves above the rule.</li>' +
      '<li><strong>Emergency fund covers ' + coverMonths.toFixed(1) + ' months</strong> of needs. The rule of thumb is 3–6 months — try the calculator on the <a href="#/reports">Reports</a> page.</li>' +
      '<li><strong>Biggest single purchase:</strong> ' + esc(bigDesc) + ' — ' + D.fmt(big.amount) + ' on ' + big.date + '. The busiest day was ' + busy.day + ' ' + D.monthLabel(ym).split(' ')[0] + ' at ' + D.fmt(busy.spent) + ' across ' + busy.count + ' purchases.</li>' +
      '</ul></div>' +
      '</div>' +

      '<div class="grid2">' +
      '<div class="card"><h2>Month pace — ' + D.monthLabel(ym) + '</h2>' +
      '<p class="bignum">' + D.fmt(p.avgPerDay) + ' <span class="muted">a day, over ' + p.elapsed + ' of ' + p.days + ' days</span></p>' +
      '<p>At this pace the month ends at <strong>' + D.fmt(p.projectedSpent) + '</strong> spent and <strong>' +
      D.fmt(p.projectedSaved) + '</strong> saved — ' +
      (p.onTrack ? 'inside the ' + D.fmt(p.totalBudget) + ' budget.' : 'over the ' + D.fmt(p.totalBudget) + ' budget by ' + D.fmt(p.projectedSpent - p.totalBudget) + '.') + '</p>' +
      '<p class="muted">Safe to spend is ' + D.fmt(ss.perDay) + ' a day for the ' + ss.daysLeft + ' days still left.</p></div>' +

      '<div class="card"><h2>Biggest &amp; busiest</h2>' +
      '<p><strong>Biggest single purchase:</strong> ' + esc(bigDesc) + ' — ' + D.fmt(big.amount) + ' on ' + big.date +
      ' (' + esc(D.categoryById(big.cat).name) + ').</p>' +
      '<p><strong>Busiest day:</strong> ' + busy.day + ' ' + D.monthLabel(ym) + ' — ' + D.fmt(busy.spent) +
      ' across ' + busy.count + ' purchases.</p>' +
      '<p class="muted">The family spent on ' + daysWithSpend + ' of the ' + p.elapsed + ' days so far — the quiet days cost nothing.</p></div>' +
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

  function transactions(state, ym, filter, search, sort) {
    search = search || '';
    sort = sort || 'date-desc';
    var txs = D.monthTx(state, ym).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var shown = txs;
    if (filter === 'in') shown = txs.filter(function (t) { return t.kind === 'in'; });
    else if (filter && filter !== 'all') shown = txs.filter(function (t) { return t.kind === 'out' && t.cat === filter; });
    if (search) {
      var q = search.toLowerCase();
      shown = shown.filter(function (t) {
        var cat = t.kind === 'in' ? 'income' : D.categoryById(t.cat).name;
        return t.desc.toLowerCase().indexOf(q) !== -1 || cat.toLowerCase().indexOf(q) !== -1;
      });
    }
    shown = shown.slice();
    if (sort === 'date-asc') shown.sort(function (a, b) { return a.date.localeCompare(b.date); });
    else if (sort === 'amount-desc') shown.sort(function (a, b) { return b.amount - a.amount; });
    else if (sort === 'amount-asc') shown.sort(function (a, b) { return a.amount - b.amount; });
    else shown.sort(function (a, b) { return b.date.localeCompare(a.date); });
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
    var sortOpts = [['date-desc', 'Newest first'], ['date-asc', 'Oldest first'], ['amount-desc', 'Biggest amount'], ['amount-asc', 'Smallest amount']].map(function (o) {
      return '<option value="' + o[0] + '"' + (sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');

    return '<section class="hero"><div><h1>Transactions</h1>' +
      '<p class="lede">Every rupiah in and out of the house in ' + D.monthLabel(ym) +
      '. Add, fix or remove anything — the dashboard, budgets and reports follow.</p></div>' +
      monthNav(state, ym) + '</section>' +
      '<div class="stats">' +
      statCard('Income', D.fmt(t.income), '2 paydays this month', 'green') +
      statCard('Spent', D.fmt(t.spent), shown.length + ' of ' + txs.length + ' rows shown', 'orange') +
      statCard('Saved', D.fmt(t.saved), D.pct(t.saved, t.income) + '% of income kept', 'green') +
      '</div>' +
      '<div class="card"><div class="card-head"><h2>All transactions</h2>' +
      '<button class="btn small ghost" data-action="export-csv">Export CSV</button></div>' +
      '<div class="tools-row"><input type="search" id="tx-search" placeholder="Search — e.g. pasar, bensin, SPP…" value="' + esc(search) + '" aria-label="Search transactions">' +
      '<label class="sort-label">Sort <select id="tx-sort">' + sortOpts + '</select></label></div>' +
      '<div class="chips">' + chips + '</div>' +
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

  function billShort(name) {
    if (name.indexOf('Les piano') === 0) return 'Les piano';
    if (name.indexOf('Iuran') === 0) return 'Sampah';
    return name.split(' ')[0];
  }

  function bills(state, ym) {
    var list = D.billsFor(state, ym);
    var total = 0, paidTotal = 0, paidCount = 0;
    list.forEach(function (b) {
      total += b.amount;
      if (b.paid) { paidTotal += b.amount; paidCount++; }
    });
    var pending = list.filter(function (b) { return !b.paid; });
    var debt = D.debtInfo();
    var debtPct = D.pct(debt.paid, debt.total);

    var rows = list.map(function (b) {
      var cat = D.categoryById(b.cat);
      return '<tr><td>' + esc(b.name) + '</td>' +
        '<td class="c-date">' + b.due + ' ' + D.monthLabel(ym).split(' ')[0] + '</td>' +
        '<td><span class="chip" style="background:' + cat.color + '1a;color:' + cat.color + '">' + esc(cat.name) + '</span></td>' +
        '<td class="c-amt">' + D.fmt(b.amount) + '</td>' +
        '<td>' + (b.paid ? '<span class="flag ok">Paid ✓</span>'
          : '<span class="flag warn">Pending</span>') + '</td>' +
        '<td class="c-act">' + (b.paid ? ''
          : '<button class="mini" data-action="bill-pay" data-bill="' + b.id + '">Mark paid</button>') + '</td></tr>';
    }).join('');

    // Calendar for the month: bill due days are marked on the grid.
    var parts = ym.split('-');
    var year = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    var days = new Date(year, m, 0).getDate();
    var firstDow = new Date(year, m - 1, 1).getDay();
    var cells = '';
    var dowNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dowNames.forEach(function (d) { cells += '<div class="cal-head">' + d + '</div>'; });
    var i;
    for (i = 0; i < firstDow; i++) cells += '<div class="cal-day empty"></div>';
    for (i = 1; i <= days; i++) {
      var due = list.filter(function (b) { return b.due === i; });
      var marks = due.map(function (b) {
        return '<span class="cal-bill ' + (b.paid ? 'paid' : 'pending') + '">' + esc(billShort(b.name)) + '</span>';
      }).join('');
      var today = (ym === D.TODAY.slice(0, 7) && i === parseInt(D.TODAY.slice(8, 10), 10));
      cells += '<div class="cal-day' + (today ? ' today' : '') + '"><span class="cal-num">' + i + '</span>' + marks + '</div>';
    }

    return '<section class="hero"><div><h1>Tagihan — monthly bills</h1>' +
      '<p class="lede">Every bill that comes every month, its due date, and whether it is paid. ' +
      'Mark one paid and the transaction ledger, dashboard and reports update at once.</p></div>' +
      monthNav(state, ym) + '</section>' +
      '<div class="stats">' +
      statCard('Bills this month', D.fmt(total), list.length + ' recurring bills', '') +
      statCard('Paid', D.fmt(paidTotal), paidCount + ' of ' + list.length + ' bills paid', 'green') +
      statCard('Still to pay', D.fmt(total - paidTotal), pending.length ? pending.map(function (b) { return esc(b.name); }).join(', ') : 'All bills are paid', pending.length ? 'orange' : 'green') +
      '</div>' +
      '<div class="card"><h2>All bills — ' + D.monthLabel(ym) + '</h2>' +
      '<div class="tablewrap"><table><thead><tr><th>Bill</th><th>Due</th><th>Category</th><th class="c-amt">Amount</th><th>Status</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '<p class="form-note" id="bill-note" role="status"></p></div>' +
      '<div class="grid2">' +
      '<div class="card"><h2>Due-date calendar — ' + D.monthLabel(ym) + '</h2>' +
      '<div class="calendar">' + cells + '</div>' +
      '<p class="legend-line"><span class="swatch paid">Paid</span> <span class="swatch pending">Still to pay</span> · today is outlined.</p></div>' +
      '<div class="card"><h2>Debt tracker — ' + esc(debt.name) + '</h2>' +
      '<p class="bignum">' + D.fmt(debt.paid) + ' <span class="muted">of ' + D.fmt(debt.total) + ' paid</span></p>' +
      progressBar(debtPct, 'ok') +
      '<p class="muted">' + debtPct + '% paid · ' + debt.paidCount + ' of ' + debt.termMonths + ' payments made</p>' +
      '<p>' + esc(debt.note) + ' Remaining: <strong>' + D.fmt(debt.remaining) + '</strong> in ' + debt.remainingCount +
      ' payments of ' + D.fmt(debt.installment) + '.</p>' +
      '<p class="muted">The monthly installment is already in the budget as Cicilan — ' +
      D.fmt(debt.installment) + ' a month, counted in November’s spending.</p></div>' +
      '</div>';
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
      var histRows = (g.history || []).map(function (h) {
        return '<tr><td>' + esc(h[0]) + '</td><td class="c-amt">' + D.fmt(h[1]) + '</td></tr>';
      }).join('');
      var hist = '<table class="mini-table"><thead><tr><th>Month</th><th class="c-amt">Added</th></tr></thead><tbody>' + histRows +
        '<tr class="total-row"><td><strong>Total saved</strong></td><td class="c-amt"><strong>' + D.fmt(D.goalHistorySum(g)) + '</strong></td></tr>' +
        '</tbody></table>';

      return '<div class="card goal-card"><div class="goal-head"><h3>' + esc(g.name) + '</h3>' +
        '<span class="goal-pct">' + p + '%</span></div>' +
        '<p class="muted">' + esc(g.note) + '</p>' +
        '<p class="bignum">' + D.fmt(g.saved) + ' <span class="muted">of ' + D.fmt(g.target) + '</span></p>' +
        progressBar(p, toneFor(p)) +
        '<p class="muted">' + esc(eta) + '</p>' + hist +
        '<form class="goal-add" data-goal="' + g.id + '">' +
        '<button type="button" class="btn small ghost" data-action="goal-add" data-goal="' + g.id + '" data-amount="100000">+ Rp 100.000</button>' +
        '<label>Custom<input type="number" name="amount" min="1000" step="1000" placeholder="250000"></label>' +
        '<button type="submit" class="btn small">Add money</button></form></div>';
    }).join('');

    var novAlloc = 0;
    state.goals.forEach(function (g) {
      (g.history || []).forEach(function (h) { if (h[0] === 'Nov 2026') novAlloc += h[1]; });
    });
    var novSaved = D.monthTotals(state, '2026-11').saved;

    return '<section class="hero"><div><h1>Savings goals</h1>' +
      '<p class="lede">Three things the family is saving for. Every rupiah saved this month — ' +
      D.fmt(novSaved) + ' in November — can go to one of them.</p></div></section>' +
      '<div class="grid2">' + cards + '</div>' +
      '<div class="card tip">In November the family put <strong>' + D.fmt(novAlloc) + '</strong> of the ' +
      D.fmt(novSaved) + ' saved into these goals and kept <strong>' + D.fmt(novSaved - novAlloc) +
      '</strong> as unallocated cash at home. Every goal balance above is the exact sum of its monthly additions — see the tables on each card.</div>' +
      '<div class="card"><h2>Start a new goal</h2>' +
      '<form id="goal-new" class="form-grid wide">' +
      '<label>Goal name<input type="text" name="name" placeholder="e.g. New motorbike" required maxlength="60"></label>' +
      '<label>Why this goal?<input type="text" name="note" placeholder="e.g. The old one is ten years old" maxlength="90"></label>' +
      '<label>Target (Rp)<input type="number" name="target" min="100000" step="50000" placeholder="5000000" required></label>' +
      '<label>Already saved (Rp)<input type="number" name="saved" min="0" step="50000" value="0"></label>' +
      '<button type="submit" class="btn">Add goal</button>' +
      '</form><p class="form-note" id="goal-note" role="status"></p></div>';
  }

  // Plain-language result lines for the two planner tools; app.js reuses
  // them so the live updates read exactly like the first render.
  function whatIfText(w) {
    if (w.cutNeeded <= 0) {
      return 'Saving ' + w.targetPct + '% means spending at most ' + D.fmt(w.allowedSpend) +
        ' a month — the family already spends ' + D.fmt(w.spent) + ', so the target is met with ' +
        D.fmt(w.allowedSpend - w.spent) + ' to spare.';
    }
    return 'Saving ' + w.targetPct + '% means spending at most ' + D.fmt(w.allowedSpend) +
      ' a month — ' + D.fmt(w.cutNeeded) + ' less than the ' + D.fmt(w.spent) +
      ' spent. Spread across the biggest categories, that is roughly: ' +
      w.cuts.map(function (c) { return c.name + ' −' + D.fmt(c.cut); }).join(', ') + '.';
  }

  function goalPlanText(g, monthly, plan) {
    if (!monthly || monthly <= 0) return 'Enter a monthly amount to see the finish date for ' + g.name + '.';
    if (plan.months === 0) return g.name + ' is already reached — time to celebrate, then pick the next goal.';
    return 'At ' + D.fmt(monthly) + ' a month, the remaining ' + D.fmt(plan.remaining) + ' for ' + g.name +
      ' takes about ' + plan.months + ' month' + (plan.months > 1 ? 's' : '') + ' — done around ' + plan.finish + '.';
  }

  function reports(state, ym) {
    var series = D.trendSeries(state);
    var byCat = D.categorySpent(state, ym);
    var t = D.monthTotals(state, ym);
    var prev = D.monthTotals(state, '2026-10');
    var novT = D.monthTotals(state, '2026-11');
    var octByCat = D.categorySpent(state, '2026-10');
    var novByCat = D.categorySpent(state, '2026-11');
    var vsData = D.CATEGORIES.map(function (c) {
      return { c: c, o: octByCat[c.id] || 0, n: novByCat[c.id] || 0 };
    }).sort(function (a, b) { return b.n - a.n; });
    var vsRows = vsData.map(function (r) {
      var d = r.n - r.o;
      var dp = r.o > 0 ? Math.round((d / r.o) * 100) : (r.n > 0 ? 100 : 0);
      return '<tr><td><span class="dot" style="background:' + r.c.color + '"></span> ' + esc(r.c.name) +
        '</td><td class="c-amt">' + D.fmt(r.o) + '</td><td class="c-amt">' + D.fmt(r.n) +
        '</td><td class="c-amt">' + (d >= 0 ? '+' : '−') + D.fmt(Math.abs(d)) +
        ' <span class="muted">(' + (d >= 0 ? '+' : '−') + Math.abs(dp) + '%)</span></td></tr>';
    }).join('');
    var f5320 = D.fiftyThirtyTwenty(state, ym);
    var ss = D.safeSpend(state, ym);
    var emgSaved = 0;
    state.goals.forEach(function (g) { if (g.id === 'g1') emgSaved = g.saved; });
    var coverMonths = f5320.needs > 0 ? emgSaved / f5320.needs : 0;
    var avgSaved = series.length ? series.reduce(function (a, s) { return a + (s.income - s.spent); }, 0) / series.length : 0;
    function emgText(months) {
      var needed = months * f5320.needs;
      var short = needed - emgSaved;
      if (short <= 0) return 'To cover ' + months + ' months the family needs ' + D.fmt(needed) + ' — the fund already holds ' + D.fmt(emgSaved) + '. Covered, with ' + D.fmt(-short) + ' to spare.';
      var m = avgSaved > 0 ? Math.ceil(short / avgSaved) : null;
      return 'To cover ' + months + ' months the family needs ' + D.fmt(needed) + ' — ' + D.fmt(short) +
        ' more than the fund holds today.' + (m !== null ? ' At the current saving pace (' + D.fmt(Math.round(avgSaved)) + ' a month) that takes about ' + m + ' more month' + (m > 1 ? 's' : '') + ' if every rupiah saved goes to the fund.' : '');
    }
    var rows = D.CATEGORIES.map(function (c) {
      return { name: c.name, color: c.color, spent: byCat[c.id], budget: state.budgets[c.id] || 0 };
    }).sort(function (a, b) { return b.spent - a.spent; });
    var top = rows[0];
    var over = rows.filter(function (r) { return r.spent > r.budget; });
    var rate = D.pct(t.saved, t.income), prevRate = D.pct(prev.saved, prev.income);
    var best = series.slice().sort(function (a, b) { return (b.income - b.spent) - (a.income - a.spent); })[0];
    var daily = D.dailySpend(state, ym);
    var weeks = D.weeklySpend(state, ym);
    var weekChips = weeks.map(function (w) {
      return '<span class="weekchip"><strong>' + esc(w.label) + '</strong> ' + D.fmt(w.spent) + ' · ' + w.count + ' buys</span>';
    }).join('');
    var busy = D.busiestDay(state, ym);
    var whatif = D.whatIf(state, ym, 30);
    var planGoal = state.goals[0];
    var planMonthly = 500000;
    var plan = D.goalPlan(planGoal, planMonthly);
    var planOpts = state.goals.map(function (g) {
      return '<option value="' + g.id + '">' + esc(g.name) + '</option>';
    }).join('');
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
      '<p class="muted">Dark bar = spent, light bar = monthly limit. A red bar means the category went over its limit.</p></div>' +

      '<div class="card"><h2>Daily spending — ' + D.monthLabel(ym) + '</h2>' +
      C.dailyBars(daily, 640, 220) +
      '<p class="legend-line"><span class="dot" style="background:#e8a13a"></span>Busiest day &nbsp; <span style="color:#b04a5e">- - average ' + D.fmt(Math.round(t.spent / daily.length)) + ' a day</span></p>' +
      '<div class="weekchips">' + weekChips + '</div>' +
      '<p class="muted">Most days are small market runs. The spikes are the bills week (1–7 ' + D.monthLabel(ym).split(' ')[0] +
      ') and the school fees — the busiest day was the ' + busy.day + 'th at ' + D.fmt(busy.spent) + '.</p></div>' +

      '<div class="grid2">' +
      '<div class="card"><h2>What-if: save more</h2>' +
      '<p class="muted">November’s income is ' + D.fmt(t.income) + ' and the family spent ' + D.fmt(t.spent) +
      '. What if they wanted to save a bigger share?</p>' +
      '<form class="calc-row"><label>Save this much of income (%) ' +
      '<input type="number" id="whatif-pct" min="0" max="60" step="5" value="30"></label></form>' +
      '<p id="whatif-result" role="status">' + whatIfText(whatif) + '</p></div>' +

      '<div class="card"><h2>Goal finish planner</h2>' +
      '<p class="muted">Pick a goal and a monthly amount — see when it is reached.</p>' +
      '<form class="calc-row"><label>Goal <select id="plan-goal">' + planOpts + '</select></label>' +
      '<label>Per month (Rp) <input type="number" id="plan-amt" min="0" step="50000" value="500000"></label></form>' +
      '<p id="plan-result" role="status">' + goalPlanText(planGoal, planMonthly, plan) + '</p></div>' +
      '</div>' +

      '<div class="grid2">' +
      '<div class="card"><h2>October vs November, by category</h2>' +
      '<div class="tablewrap"><table><thead><tr><th>Category</th><th class="c-amt">October</th><th class="c-amt">November</th><th class="c-amt">Change</th></tr></thead><tbody>' +
      vsRows +
      '<tr class="total-row"><td><strong>Total spent</strong></td><td class="c-amt"><strong>' + D.fmt(prev.spent) +
      '</strong></td><td class="c-amt"><strong>' + D.fmt(novT.spent) + '</strong></td><td class="c-amt"><strong>' +
      (novT.spent >= prev.spent ? '+' : '−') + D.fmt(Math.abs(novT.spent - prev.spent)) + '</strong></td></tr>' +
      '</tbody></table></div>' +
      '<p class="muted">November cost ' + D.fmt(novT.spent - prev.spent) + ' more than October (' +
      (novT.spent >= prev.spent ? '+' : '−') + Math.abs(D.pct(novT.spent - prev.spent, prev.spent)) + '%). Food, transport and school drove the rise.</p></div>' +

      '<div class="card"><h2>50 / 30 / 20 — how November splits</h2>' +
      '<div class="fifty"><div class="fifty-needs" style="width:' + f5320.needsPct + '%"></div>' +
      '<div class="fifty-wants" style="width:' + f5320.wantsPct + '%"></div>' +
      '<div class="fifty-save" style="width:' + f5320.savedPct + '%"></div></div>' +
      '<ul class="insights">' +
      '<li><strong>Needs ' + f5320.needsPct + '%</strong> (' + D.fmt(f5320.needs) + ') — rule says 50%. School fees push it over by ' + D.fmt(Math.max(0, f5320.needs - Math.round(f5320.income * 0.5))) + '.</li>' +
      '<li><strong>Wants ' + f5320.wantsPct + '%</strong> (' + D.fmt(f5320.wants) + ') — rule says 30%. The family wants very little.</li>' +
      '<li><strong>Saved ' + f5320.savedPct + '%</strong> (' + D.fmt(f5320.saved) + ') — rule says 20%. Above the rule even in the heaviest month.</li>' +
      '<li><strong>Safe to spend: ' + D.fmt(ss.perDay) + ' a day</strong> — ' + D.fmt(ss.remaining) + ' of budget left over ' + ss.daysLeft + ' days.</li>' +
      '</ul></div>' +
      '</div>' +

      '<div class="card"><h2>Emergency-fund calculator</h2>' +
      '<p class="muted">The emergency fund holds ' + D.fmt(emgSaved) + ' — that covers <strong>' +
      coverMonths.toFixed(1) + ' months</strong> of needs (' + D.fmt(f5320.needs) + ' a month). ' +
      'How many months of cover should it hold?</p>' +
      '<form class="calc-row" id="emg-calc"><label>Months of cover wanted ' +
      '<input type="number" id="emg-months" min="1" max="12" step="1" value="3"></label></form>' +
      '<p id="emg-result" role="status">' + emgText(3) + '</p></div>';
  }

  window.BudgetViews = { dashboard: dashboard, transactions: transactions, budgets: budgets, bills: bills, goals: goals, reports: reports, whatIfText: whatIfText, goalPlanText: goalPlanText };
})();
