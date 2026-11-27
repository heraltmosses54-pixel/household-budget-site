// app.js — router and wiring. Hash routes: #/ (dashboard), #/transactions,
// #/budgets, #/goals, #/reports. One state object (data.js) is rendered,
// every control updates it, saves it, and re-renders — so the totals,
// charts and bars always agree.

(function () {
  'use strict';

  var D = window.BudgetData;
  var V = window.BudgetViews;
  var state = D.loadState();
  var month = '2026-11';
  var filter = 'all';
  var search = '';
  var sort = 'date-desc';

  var NAV = [
    { href: '#/', label: 'Dashboard' },
    { href: '#/transactions', label: 'Transactions' },
    { href: '#/budgets', label: 'Budgets' },
    { href: '#/bills', label: 'Bills' },
    { href: '#/goals', label: 'Goals' },
    { href: '#/reports', label: 'Reports' }
  ];

  function currentRoute() {
    var h = window.location.hash || '#/';
    if (h.indexOf('#/transactions') === 0) return 'transactions';
    if (h.indexOf('#/budgets') === 0) return 'budgets';
    if (h.indexOf('#/bills') === 0) return 'bills';
    if (h.indexOf('#/goals') === 0) return 'goals';
    if (h.indexOf('#/reports') === 0) return 'reports';
    return 'dashboard';
  }

  function render() {
    var route = currentRoute();
    var view = document.getElementById('view');
    if (route === 'transactions') view.innerHTML = V.transactions(state, month, filter, search, sort);
    else if (route === 'budgets') view.innerHTML = V.budgets(state, month);
    else if (route === 'bills') view.innerHTML = V.bills(state, month);
    else if (route === 'goals') view.innerHTML = V.goals(state, month);
    else if (route === 'reports') view.innerHTML = V.reports(state, month);
    else view.innerHTML = V.dashboard(state, month);
    document.querySelectorAll('#mainnav a').forEach(function (a) {
      var on = a.getAttribute('href') === '#/' + (route === 'dashboard' ? '' : route);
      if (route === 'dashboard' && a.getAttribute('href') === '#/') on = true;
      a.classList.toggle('on', on);
    });
    window.scrollTo(0, 0);
  }

  function rerender() { D.saveState(state); render(); }

  function note(id, msg) {
    var n = document.getElementById(id);
    if (n) n.textContent = msg;
  }

  function addTransaction(form) {
    var date = form.date.value, desc = form.desc.value.trim();
    var cat = form.cat.value, amount = parseInt(form.amount.value, 10);
    var kind = form.kind ? form.kind.value : 'out';
    if (!date || !desc || !amount || amount <= 0) return false;
    state.transactions.push({
      id: 't' + (state.nextId++), date: date, desc: desc, cat: cat, amount: amount, kind: kind
    });
    return true;
  }

  function exportCsv() {
    var txs = D.monthTx(state, month).slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    if (filter === 'in') txs = txs.filter(function (t) { return t.kind === 'in'; });
    else if (filter && filter !== 'all') txs = txs.filter(function (t) { return t.kind === 'out' && t.cat === filter; });
    if (search) {
      var q = search.toLowerCase();
      txs = txs.filter(function (t) {
        var cat = t.kind === 'in' ? 'income' : D.categoryById(t.cat).name;
        return t.desc.toLowerCase().indexOf(q) !== -1 || cat.toLowerCase().indexOf(q) !== -1;
      });
    }
    var lines = ['Date,Description,Category,Amount (Rp),Type'];
    txs.forEach(function (t) {
      var cat = t.kind === 'in' ? 'Income' : D.categoryById(t.cat).name;
      var desc = '"' + t.desc.replace(/"/g, '""') + '"';
      lines.push([t.date, desc, '"' + cat + '"', t.amount, t.kind === 'in' ? 'Income' : 'Expense'].join(','));
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dompet-keluarga-' + month + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function startEdit(row) {
    var id = row.getAttribute('data-id');
    var tx = null;
    state.transactions.forEach(function (t) { if (t.id === id) tx = t; });
    if (!tx) return;
    var cells = row.querySelectorAll('td');
    var catOpts = D.CATEGORIES.map(function (c) {
      return '<option value="' + c.id + '"' + (tx.cat === c.id ? ' selected' : '') + '>' + c.name + '</option>';
    }).join('');
    cells[0].innerHTML = '<input type="date" class="edit-date" value="' + tx.date + '">';
    cells[1].innerHTML = '<input type="text" class="edit-desc" value="' + tx.desc.replace(/"/g, '&quot;') + '" maxlength="80">';
    cells[2].innerHTML = '<select class="edit-cat">' + catOpts + '</select>';
    cells[3].innerHTML = '<input type="number" class="edit-amt" min="1000" step="500" value="' + tx.amount + '">';
    cells[4].innerHTML = '<button class="mini" data-action="tx-save" data-id="' + tx.id + '">Save</button> ' +
      '<button class="mini" data-action="tx-cancel">Cancel</button>';
  }

  function saveEdit(row) {
    var id = row.getAttribute('data-id');
    var tx = null;
    state.transactions.forEach(function (t) { if (t.id === id) tx = t; });
    if (!tx) return;
    var date = row.querySelector('.edit-date').value;
    var desc = row.querySelector('.edit-desc').value.trim();
    var cat = row.querySelector('.edit-cat').value;
    var amount = parseInt(row.querySelector('.edit-amt').value, 10);
    if (!date || !desc || !amount || amount <= 0) return;
    tx.date = date; tx.desc = desc; tx.cat = cat; tx.amount = amount;
    rerender();
  }

  // Add money to a goal and record it in the goal's funding history, so
  // the history still sums exactly to the saved balance afterwards.
  function addToGoal(goalId, amt) {
    state.goals.forEach(function (g) {
      if (g.id !== goalId) return;
      g.saved += amt;
      if (!g.history) g.history = [];
      var label = D.monthLabel(month).replace('November', 'Nov').replace('October', 'Oct');
      var found = false;
      g.history.forEach(function (h) { if (h[0] === label) { h[1] += amt; found = true; } });
      if (!found) g.history.push([label, amt]);
    });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    e.preventDefault();
    if (form.id === 'quick-add') {
      if (addTransaction(form)) { rerender(); note('quick-note', 'Added — the totals above already include it.'); }
    } else if (form.id === 'tx-add') {
      if (addTransaction(form)) { rerender(); note('tx-note', 'Transaction added.'); }
    } else if (form.classList.contains('budget-edit')) {
      var cat = form.getAttribute('data-cat');
      var val = parseInt(form.budget.value, 10);
      if (!isNaN(val) && val >= 0) {
        state.budgets[cat] = val;
        rerender();
        note('budget-note', D.categoryById(cat).name + ' limit set to ' + D.fmt(val) + ' per month.');
      }
    } else if (form.classList.contains('goal-add')) {
      var goalId = form.getAttribute('data-goal');
      var amt = parseInt(form.amount.value, 10);
      if (isNaN(amt) || amt <= 0) { note('goal-note', 'Enter an amount first.'); return; }
      addToGoal(goalId, amt);
      rerender();
    } else if (form.id === 'goal-new') {
      var target = parseInt(form.target.value, 10);
      var saved = parseInt(form.saved.value, 10) || 0;
      if (!form.name.value.trim() || isNaN(target) || target <= 0) return;
      var newLabel = D.monthLabel(month).replace('November', 'Nov').replace('October', 'Oct');
      state.goals.push({
        id: 'g' + (state.nextGoal++), name: form.name.value.trim(),
        note: form.note.value.trim() || 'A new thing to save for.',
        target: target, saved: saved,
        history: saved > 0 ? [[newLabel, saved]] : []
      });
      rerender();
      note('goal-note', 'Goal added — good luck saving for it.');
    }
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'month-prev' || action === 'month-next') {
      var months = ['2026-10', '2026-11'];
      var i = months.indexOf(month);
      var j = action === 'month-prev' ? i - 1 : i + 1;
      if (j >= 0 && j < months.length) { month = months[j]; render(); }
    } else if (action === 'filter') {
      filter = btn.getAttribute('data-filter');
      render();
    } else if (action === 'tx-del') {
      var id = btn.getAttribute('data-id');
      state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
      rerender();
    } else if (action === 'tx-edit') {
      startEdit(btn.closest('tr'));
    } else if (action === 'tx-save') {
      saveEdit(btn.closest('tr'));
    } else if (action === 'tx-cancel') {
      render();
    } else if (action === 'goal-add') {
      var goalId = btn.getAttribute('data-goal');
      var amt = parseInt(btn.getAttribute('data-amount'), 10);
      addToGoal(goalId, amt);
      rerender();
    } else if (action === 'bill-pay') {
      var billId = btn.getAttribute('data-bill');
      var bills = D.billsFor(state, month);
      var bill = null;
      bills.forEach(function (b) { if (b.id === billId) bill = b; });
      if (!bill || bill.paid) return;
      var day = String(bill.due);
      if (day.length < 2) day = '0' + day;
      state.transactions.push({
        id: 't' + (state.nextId++), date: month + '-' + day,
        desc: bill.name + ' — ' + D.monthLabel(month).split(' ')[0],
        cat: bill.cat, amount: bill.amount, kind: 'out'
      });
      rerender();
      note('bill-note', bill.name + ' marked paid — ' + D.fmt(bill.amount) + ' added to the ledger.');
    } else if (action === 'export-csv') {
      exportCsv();
    } else if (action === 'reset-data') {
      state = D.resetState();
      month = '2026-11'; filter = 'all'; search = ''; sort = 'date-desc';
      rerender();
    }
  });

  // Emergency-fund calculator: recompute the result live as the months change.
  // Same for the what-if planner, the goal planner and the search box.
  document.addEventListener('input', function (e) {
    if (!e.target) return;
    if (e.target.id === 'tx-search') {
      search = e.target.value;
      render();
      var box = document.getElementById('tx-search');
      if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
      return;
    }
    if (e.target.id === 'whatif-pct') {
      var pct = parseInt(e.target.value, 10);
      if (isNaN(pct) || pct < 0) pct = 0;
      if (pct > 60) pct = 60;
      var out = document.getElementById('whatif-result');
      if (out) out.textContent = V.whatIfText(D.whatIf(state, month, pct));
      return;
    }
    if (e.target.id === 'plan-amt' || e.target.id === 'plan-goal') {
      updatePlanResult();
      return;
    }
    if (e.target.id !== 'emg-months') return;
    var months = parseInt(e.target.value, 10);
    if (isNaN(months) || months < 1) months = 1;
    if (months > 12) months = 12;
    var f = D.fiftyThirtyTwenty(state, month);
    var emgSaved = 0;
    state.goals.forEach(function (g) { if (g.id === 'g1') emgSaved = g.saved; });
    var series = D.trendSeries(state);
    var avgSaved = series.length ? series.reduce(function (a, s) { return a + (s.income - s.spent); }, 0) / series.length : 0;
    var needed = months * f.needs;
    var short = needed - emgSaved;
    var msg;
    if (short <= 0) {
      msg = 'To cover ' + months + ' months the family needs ' + D.fmt(needed) + ' — the fund already holds ' + D.fmt(emgSaved) + '. Covered, with ' + D.fmt(-short) + ' to spare.';
    } else {
      var m = avgSaved > 0 ? Math.ceil(short / avgSaved) : null;
      msg = 'To cover ' + months + ' months the family needs ' + D.fmt(needed) + ' — ' + D.fmt(short) +
        ' more than the fund holds today.' + (m !== null ? ' At the current saving pace (' + D.fmt(Math.round(avgSaved)) + ' a month) that takes about ' + m + ' more month' + (m > 1 ? 's' : '') + ' if every rupiah saved goes to the fund.' : '');
    }
    var out = document.getElementById('emg-result');
    if (out) out.textContent = msg;
  });

  function updatePlanResult() {
    var sel = document.getElementById('plan-goal');
    var amtEl = document.getElementById('plan-amt');
    var out = document.getElementById('plan-result');
    if (!sel || !amtEl || !out) return;
    var g = null;
    state.goals.forEach(function (x) { if (x.id === sel.value) g = x; });
    if (!g) return;
    var monthly = parseInt(amtEl.value, 10);
    if (isNaN(monthly) || monthly < 0) monthly = 0;
    out.textContent = V.goalPlanText(g, monthly, D.goalPlan(g, monthly));
  }

  // Sort select + goal select fire change (and input in most browsers).
  document.addEventListener('change', function (e) {
    if (!e.target) return;
    if (e.target.id === 'tx-sort') { sort = e.target.value; render(); }
    else if (e.target.id === 'plan-goal') updatePlanResult();
  });

  window.addEventListener('hashchange', render);

  // Build the nav once, then render.
  var nav = document.getElementById('mainnav');
  NAV.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    nav.appendChild(a);
  });
  render();
})();
