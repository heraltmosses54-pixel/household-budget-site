// charts.js — small SVG chart builders. No libraries, no network:
// every chart is drawn from the family's own numbers in data.js.

(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Donut: one ring segment per category, centre shows the total spent.
  function donut(segments, size, thickness) {
    var r = size / 2 - thickness / 2;
    var cx = size / 2, cy = size / 2;
    var total = segments.reduce(function (a, s) { return a + s.value; }, 0);
    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size +
      '" role="img" aria-label="Spending by category">';
    if (total <= 0) {
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#e5e0d5" stroke-width="' + thickness + '"/>';
    } else {
      var offset = 0.25; // start at the top
      segments.forEach(function (s) {
        if (s.value <= 0) return;
        var frac = s.value / total;
        var a0 = (offset - 0.25) * Math.PI * 2;
        var a1 = (offset + frac - 0.25) * Math.PI * 2;
        var large = frac > 0.5 ? 1 : 0;
        var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        svg += '<path d="M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r + ' ' + r +
          ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
          '" fill="none" stroke="' + s.color + '" stroke-width="' + thickness + '"/>';
        offset += frac;
      });
    }
    svg += '</svg>';
    return svg;
  }

  // Grouped bars: income vs spent per month, with value labels.
  function monthBars(series, width, height) {
    var padL = 8, padB = 26, padT = 24;
    var max = 0;
    series.forEach(function (s) { max = Math.max(max, s.income, s.spent); });
    max = Math.ceil(max / 1000000) * 1000000;
    var innerW = width - padL * 2, innerH = height - padT - padB;
    var groupW = innerW / series.length;
    var barW = Math.min(26, (groupW - 18) / 2);
    var fmt = window.BudgetData.fmtShort;
    var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" height="' + height +
      '" role="img" aria-label="Income versus spending by month">';
    // gridlines at 0 / half / max
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + innerH * (1 - f);
      svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (width - padL) + '" y2="' + y +
        '" stroke="#e5e0d5" stroke-width="1"/>';
      svg += '<text x="' + (width - padL) + '" y="' + (y - 4) + '" font-size="10" fill="#8a8378" text-anchor="end">' +
        fmt(max * f) + '</text>';
    });
    series.forEach(function (s, i) {
      var gx = padL + i * groupW + (groupW - barW * 2 - 6) / 2;
      var hIn = (s.income / max) * innerH, hSp = (s.spent / max) * innerH;
      var yIn = padT + innerH - hIn, ySp = padT + innerH - hSp;
      svg += '<rect x="' + gx.toFixed(1) + '" y="' + yIn.toFixed(1) + '" width="' + barW + '" height="' + hIn.toFixed(1) +
        '" rx="3" fill="#2e7d5b"><title>Income ' + esc(s.month) + ': ' + fmt(s.income) + '</title></rect>';
      svg += '<rect x="' + (gx + barW + 6).toFixed(1) + '" y="' + ySp.toFixed(1) + '" width="' + barW + '" height="' + hSp.toFixed(1) +
        '" rx="3" fill="#c96a2e"><title>Spent ' + esc(s.month) + ': ' + fmt(s.spent) + '</title></rect>';
      svg += '<text x="' + (padL + i * groupW + groupW / 2).toFixed(1) + '" y="' + (height - 8) +
        '" font-size="11" fill="#5c564a" text-anchor="middle">' + esc(s.month) + '</text>';
    });
    svg += '</svg>';
    return svg;
  }

  // Horizontal bars: one row per category, spent vs budget.
  function categoryBars(rows) {
    var max = 0;
    rows.forEach(function (r) { max = Math.max(max, r.budget, r.spent); });
    if (max <= 0) max = 1;
    var html = '<div class="catbars">';
    rows.forEach(function (r) {
      var spentPct = Math.min(100, (r.spent / max) * 100);
      var budgetPct = (r.budget / max) * 100;
      var over = r.spent > r.budget;
      html += '<div class="catbar-row">' +
        '<div class="catbar-label"><span class="dot" style="background:' + r.color + '"></span>' +
        esc(r.name) + '</div>' +
        '<div class="catbar-track">' +
        '<div class="catbar-budget" style="width:' + budgetPct.toFixed(1) + '%"></div>' +
        '<div class="catbar-spent' + (over ? ' over' : '') + '" style="width:' + spentPct.toFixed(1) + '%;background:' + r.color + '"></div>' +
        '</div>' +
        '<div class="catbar-num">' + window.BudgetData.fmt(r.spent) +
        ' <span class="muted">/ ' + window.BudgetData.fmt(r.budget) + '</span></div>' +
        '</div>';
    });
    return html + '</div>';
  }

  window.BudgetCharts = { donut: donut, monthBars: monthBars, categoryBars: categoryBars, esc: esc };
})();
