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

  var NAV = [
    { href: '#/', label: 'Dashboard' },
    { href: '#/transactions', label: 'Transactions' },
    { href: '#/budgets', label: 'Budgets' },
    { href: '#/goals', label: 'Goals' },
    { href: '#/reports', label: 'Reports' }
  ];

  function currentRoute() {
    var h = window.location.hash || '#/';
    if (h.indexOf('#/transactions') === 0) return 'transactions';
    if (h.indexOf('#/budgets') === 0) return 'budgets';
    if (h.indexOf('#/goals') === 0) return 'goals';
    if (h.indexOf('#/reports') === 0) return 'reports';
    return 'dashboard';
  }

  function render() {
    var route = currentRoute();
    var view = document.getElementById('view');
    if (route === 'transactions') view.innerHTML = V.transactions(state, month, filter);
    else if (route === 'budgets') view.innerHTML = V.budgets(state, month);
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
      state.goals.forEach(function (g) { if (g.id === goalId) g.saved += amt; });
      rerender();
    } else if (form.id === 'goal-new') {
      var target = parseInt(form.target.value, 10);
      var saved = parseInt(form.saved.value, 10) || 0;
      if (!form.name.value.trim() || isNaN(target) || target <= 0) return;
      state.goals.push({
        id: 'g' + (state.nextGoal++), name: form.name.value.trim(),
        note: form.note.value.trim() || 'A new thing to save for.',
        target: target, saved: saved
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
      state.goals.forEach(function (g) { if (g.id === goalId) g.saved += amt; });
      rerender();
    } else if (action === 'reset-data') {
      state = D.resetState();
      month = '2026-11'; filter = 'all';
      rerender();
    }
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
