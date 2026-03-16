// seed_analysis.js — Seed Analysis & Upset History views

// ── SEED ANALYSIS ─────────────────────────────────────────
function renderSeedAnalysis() {
  const el = document.getElementById('seed-analysis-content');
  if (!el) return;

  const teams = Object.values(TEAMS_DATA)
    .filter(t => t.seed && t.bpr != null && t.seed_bpr_diff != null)
    .sort((a,b) => b.seed_bpr_diff - a.seed_bpr_diff);

  const underseeded = teams.filter(t => t.seed_bpr_diff >= 1.5);
  const overseeded  = teams.filter(t => t.seed_bpr_diff <= -2.0);
  const fairseeded  = teams.filter(t => t.seed_bpr_diff > -2.0 && t.seed_bpr_diff < 1.5);

  function seedColor(diff) {
    if (diff >= 3.0)  return '#f59e0b';   // gold = very underseeded
    if (diff >= 1.5)  return '#fb923c';   // orange = underseeded
    if (diff >= -1.0) return '#4ade80';   // green = fair
    if (diff >= -2.5) return '#60a5fa';   // blue = slightly over
    return '#f87171';                      // red = overseeded
  }

  function seedLabel(diff) {
    if (diff >= 3.0)  return 'VERY UNDERSEEDED';
    if (diff >= 1.5)  return 'UNDERSEEDED';
    if (diff >= -1.0) return 'FAIRLY SEEDED';
    if (diff >= -2.5) return 'SLIGHTLY OVER';
    return 'OVERSEEDED';
  }

  // Build the scatter chart using HTML canvas-style SVG
  const chartHTML = buildSeedChart(teams);

  // Team cards
  function teamCard(t) {
    const diff = t.seed_bpr_diff;
    const color = seedColor(diff);
    const label = seedLabel(diff);
    const logo = getLogoUrl(t.name);
    const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(1);
    return '<div class="seed-card" onclick="loadTeamIntoMatchup(\''+t.name.replace(/'/g,"\\'")+'\')" style="border-color:'+color+'44">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        (logo ? '<img src="'+logo+'" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '') +
        '<div>' +
          '<div style="font-family:\'Barlow Condensed\';font-size:15px;font-weight:800;color:#e8edf5">'+t.name+'</div>' +
          '<div style="font-size:11px;color:#b0c4de">'+t.region+' · Seed '+t.seed+'</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<div>' +
          '<div style="font-size:10px;color:#b0c4de;text-transform:uppercase;letter-spacing:0.5px">BPR vs Expected</div>' +
          '<div style="font-family:\'Barlow Condensed\';font-size:20px;font-weight:900;color:'+color+'">'+diffStr+'</div>' +
          '<div style="font-size:10px;color:#8fa3c0">BPR '+t.bpr.toFixed(1)+' · Exp '+t.expected_bpr.toFixed(1)+'</div>' +
        '</div>' +
        '<span style="font-family:\'Barlow Condensed\';font-size:11px;font-weight:800;padding:3px 8px;background:'+color+'22;border:1px solid '+color+'66;border-radius:4px;color:'+color+'">'+label+'</span>' +
      '</div>' +
    '</div>';
  }

  el.innerHTML =
    '<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);padding:14px 18px;margin-bottom:16px;font-size:13px;color:#b0c4de">' +
      '<strong style="color:#f59e0b">How This Works:</strong> Each team\'s BPR (EvanMiya rating) is compared to the average BPR for teams at that seed line. ' +
      'Teams well <em>above</em> their seed\'s average are <strong style="color:#f59e0b">underseeded</strong> — historically these teams advance <strong>59% further</strong> than other teams at the same seed. ' +
      'Teams well <em>below</em> their seed\'s average may be <strong style="color:#f87171">overseeded</strong> and at higher upset risk.' +
    '</div>' +

    chartHTML +

    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px">' +
      '<div>' +
        '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#f59e0b;margin-bottom:8px">🔥 UNDERSEEDED (Advance 59% Further)</div>' +
        '<div style="display:grid;gap:8px">'+underseeded.map(teamCard).join('')+'</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#4ade80;margin-bottom:8px">✓ FAIRLY SEEDED</div>' +
        '<div style="display:grid;gap:8px">'+fairseeded.sort((a,b)=>a.seed-b.seed||b.seed_bpr_diff-a.seed_bpr_diff).map(teamCard).join('')+'</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#f87171;margin-bottom:8px">⚠️ OVERSEEDED (Upset Risk)</div>' +
        '<div style="display:grid;gap:8px">'+overseeded.map(teamCard).join('')+'</div>' +
      '</div>' +
    '</div>';

  // Click handlers wired via onclick= in teamCard
}

function buildSeedChart(teams) {
  const W = 700, H = 380;
  const PAD = { t:30, r:20, b:40, l:50 };
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;

  // X axis: seed 1-16 (reversed — 1 on right like EvanMiya)
  // Y axis: BPR
  const seeds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  const bprs = teams.map(t=>t.bpr);
  const bprMin = Math.min(...bprs) - 3;
  const bprMax = Math.max(...bprs) + 3;

  function xPos(seed) { return PAD.l + (1 - (seed-1)/15) * pw; }
  function yPos(bpr)  { return PAD.t + (1 - (bpr-bprMin)/(bprMax-bprMin)) * ph; }

  // Expected BPR curve
  const seedMeans = SEED_META.seed_means;
  const curvePts = seeds.map(s => ({ x: xPos(s), y: yPos(seedMeans[s]||0) }));
  const curvePath = curvePts.map((p,i) => (i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');

  // Dashed reference line (slightly above)
  const upperPts = seeds.map(s => ({ x: xPos(s), y: yPos((seedMeans[s]||0)+2) }));
  const upperPath = upperPts.map((p,i) => (i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');

  // Team dots
  const dots = teams.map(t => {
    const x = xPos(t.seed);
    const y = yPos(t.bpr);
    const diff = t.seed_bpr_diff;
    const color = diff >= 3.0 ? '#f59e0b' : diff >= 1.5 ? '#fb923c' : diff >= -1.0 ? '#4ade80' : diff >= -2.5 ? '#60a5fa' : '#f87171';
    const r = diff >= 1.5 || diff <= -2.0 ? 7 : 5;
    const logo = getLogoUrl(t.name);
    const tip = t.name + ' ('+t.seed+'): BPR '+t.bpr.toFixed(1)+', diff '+(diff>=0?'+':'')+diff.toFixed(1);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${color}" fill-opacity="0.85" stroke="rgba(255,255,255,0.3)" stroke-width="1">
      <title>${tip}</title></circle>`;
  }).join('');

  // X axis labels
  const xLabels = seeds.map(s =>
    `<text x="${xPos(s).toFixed(1)}" y="${H-8}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#b0c4de">${s}</text>`
  ).join('');

  // Y axis labels
  const yTicks = [-10,-5,0,5,10,15,20,25,30,35];
  const yLabels = yTicks.map(v => {
    if (v < bprMin || v > bprMax) return '';
    return `<text x="${PAD.l-6}" y="${yPos(v).toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#b0c4de">${v}</text>
    <line x1="${PAD.l}" y1="${yPos(v).toFixed(1)}" x2="${W-PAD.r}" y2="${yPos(v).toFixed(1)}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  }).join('');

  return `<div style="overflow-x:auto">
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px;background:#111827;border-radius:12px;border:1px solid #1e2d45">
    <!-- Grid and axes -->
    ${yLabels}
    ${xLabels}
    <text x="${W/2}" y="${H-2}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-size="12" font-weight="700" fill="#8fa3c0">Seed</text>
    <text x="14" y="${H/2}" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-size="12" font-weight="700" fill="#8fa3c0" transform="rotate(-90,14,${H/2})">EvanMiya BPR</text>

    <!-- Expected BPR curve (solid) -->
    <path d="${curvePath}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>

    <!-- Upper reference line (dashed) -->
    <path d="${upperPath}" fill="none" stroke="rgba(245,158,11,0.6)" stroke-width="1.5" stroke-dasharray="5,4"/>

    <!-- "Underseeded zone" label -->
    <text x="${xPos(7)}" y="${yPos((seedMeans[7]||0)+5)}" font-family="Barlow Condensed,sans-serif" font-size="11" fill="rgba(245,158,11,0.8)" font-style="italic">Teams above = underseeded</text>

    <!-- Team dots -->
    ${dots}

    <!-- Legend -->
    <rect x="${PAD.l}" y="${PAD.t+4}" width="10" height="10" fill="#f59e0b" rx="2"/>
    <text x="${PAD.l+14}" y="${PAD.t+9}" dominant-baseline="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#b0c4de">Very underseeded</text>
    <rect x="${PAD.l+120}" y="${PAD.t+4}" width="10" height="10" fill="#fb923c" rx="2"/>
    <text x="${PAD.l+134}" y="${PAD.t+9}" dominant-baseline="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#b0c4de">Underseeded</text>
    <rect x="${PAD.l+220}" y="${PAD.t+4}" width="10" height="10" fill="#4ade80" rx="2"/>
    <text x="${PAD.l+234}" y="${PAD.t+9}" dominant-baseline="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#b0c4de">Fair</text>
    <rect x="${PAD.l+270}" y="${PAD.t+4}" width="10" height="10" fill="#f87171" rx="2"/>
    <text x="${PAD.l+284}" y="${PAD.t+9}" dominant-baseline="middle" font-family="Barlow Condensed,sans-serif" font-size="11" fill="#b0c4de">Overseeded</text>
  </svg></div>`;
}

// ── UPSET HISTORY ─────────────────────────────────────────
function renderUpsetHistory() {
  const el = document.getElementById('upset-history-content');
  if (!el) return;

  const teams = TEAMS_DATA;
  const bracket = BRACKET_DATA;

  // First round matchup predictions
  const matchupPairs = [[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]];
  const r1Upsets = [];

  for (const [region, teamList] of Object.entries(bracket)) {
    const seedMap = {};
    for (const t of teamList) seedMap[t.seed] = t.team;

    for (const [hi, lo] of matchupPairs) {
      const hiName = seedMap[hi], loName = seedMap[lo];
      if (!hiName || !loName) continue;
      const hiT = teams[hiName] || {}, loT = teams[loName] || {};
      const loDiff = loT.seed_bpr_diff || 0;
      const hiDiff = hiT.seed_bpr_diff || 0;
      const loLogoUrl = getLogoUrl(loName), hiLogoUrl = getLogoUrl(hiName);

      // Find historical upset rate for this matchup
      const hist = UPSET_HISTORY.rounds[0].by_matchup?.find(m => m.matchup === `${lo} vs ${hi}`);
      const histRate = hist ? hist.upset_rate : null;

      r1Upsets.push({
        region, hiSeed:hi, loSeed:lo, hiName, loName,
        loDiff, hiDiff, loLogoUrl, hiLogoUrl,
        histRate,
        upsetScore: loDiff + (loT.ranked_win_pct||0)/50 + (loT.close_games_pct||0)/100,
        isLikely: loDiff >= 1.5 || (lo <= 12 && loDiff >= 0.5),
      });
    }
  }

  r1Upsets.sort((a,b) => b.upsetScore - a.upsetScore);

  function roundCard(round) {
    const pct = Math.round(round.upset_rate * 100);
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;text-align:center">' +
      '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#e8edf5;margin-bottom:4px">'+round.round+'</div>' +
      '<div style="font-family:\'Barlow Condensed\';font-size:28px;font-weight:900;color:#f59e0b">'+round.avg_upsets_per_year.toFixed(1)+'</div>' +
      '<div style="font-size:11px;color:#b0c4de">avg upsets / year</div>' +
      '<div style="margin-top:6px;font-size:12px;color:#8fa3c0">'+pct+'% upset rate</div>' +
    '</div>';
  }

  function upsetRow(u) {
    const diff = u.loDiff;
    const upsetColor = diff >= 2.5 ? '#f59e0b' : diff >= 1.5 ? '#fb923c' : diff >= 0.5 ? '#facc15' : '#8fa3c0';
    const urgency = diff >= 2.5 ? '🔥 HIGH' : diff >= 1.5 ? '⚠️ WATCH' : '👀 POSSIBLE';
    const hiLogo = u.hiLogoUrl ? '<img src="'+u.hiLogoUrl+'" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '';
    const loLogo = u.loLogoUrl ? '<img src="'+u.loLogoUrl+'" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '';
    const histStr = u.histRate ? ' · '+u.histRate+'% hist. rate' : '';
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-left:3px solid '+upsetColor+';border-radius:var(--radius);margin-bottom:6px">' +
      '<span style="font-family:\'Barlow Condensed\';font-size:11px;font-weight:800;color:'+upsetColor+';min-width:70px">'+urgency+'</span>' +
      '<div style="flex:1">' +
        '<div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600">' +
          loLogo + '<span style="color:#e8edf5">('+u.loSeed+') '+u.loName+'</span>' +
          '<span style="color:#8fa3c0;font-size:11px">upsets</span>' +
          hiLogo + '<span style="color:#8fa3c0">('+u.hiSeed+') '+u.hiName+'</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#b0c4de;margin-top:2px">' +
          u.region + ' · '+u.loName+' BPR '+(u.loDiff>=0?'+':'')+u.loDiff.toFixed(1)+' vs seed avg'+histStr +
        '</div>' +
      '</div>' +
    '</div>';
  }

  const likelyUpsets = r1Upsets.filter(u => u.isLikely);
  const watchlist    = r1Upsets.filter(u => !u.isLikely && u.upsetScore > -0.5).slice(0,8);

  el.innerHTML =
    // Historical stats
    '<div style="margin-bottom:16px">' +
      '<div style="font-family:\'Barlow Condensed\';font-size:18px;font-weight:800;color:#fff;margin-bottom:10px">Historical Upset Rates by Round (1985–2024)</div>' +
      '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">' +
        UPSET_HISTORY.rounds.map(roundCard).join('') +
      '</div>' +
    '</div>' +

    // Matchup upset rates
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:16px">' +
      '<div style="font-family:\'Barlow Condensed\';font-size:16px;font-weight:800;color:#f59e0b;margin-bottom:10px">First Round Upset Rates by Matchup</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
        UPSET_HISTORY.rounds[0].by_matchup.map(m => {
          const color = m.upset_rate >= 40 ? '#f87171' : m.upset_rate >= 30 ? '#fb923c' : m.upset_rate >= 20 ? '#facc15' : '#8fa3c0';
          return '<div style="text-align:center;background:var(--bg3);border-radius:6px;padding:10px">' +
            '<div style="font-family:\'Barlow Condensed\';font-size:13px;font-weight:700;color:#b0c4de">'+m.matchup+'</div>' +
            '<div style="font-family:\'Barlow Condensed\';font-size:22px;font-weight:900;color:'+color+'">'+m.upset_rate+'%</div>' +
            '<div style="font-size:10px;color:#8fa3c0">'+m.label+'</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +

    // 2026 upset predictions
    '<div style="font-family:\'Barlow Condensed\';font-size:18px;font-weight:800;color:#fff;margin-bottom:10px">2026 Tournament Upset Predictions</div>' +
    '<div style="font-size:12px;color:#b0c4de;margin-bottom:10px;padding:8px 12px;background:var(--bg2);border-left:3px solid #f59e0b;border-radius:6px">' +
      'Teams flagged as underseeded (BPR significantly above seed average) are most dangerous. ' +
      'Underseeded teams advance 59% further than expected per EvanMiya research.' +
    '</div>' +
    (likelyUpsets.length ? '<div style="margin-bottom:12px">' +
      '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#f59e0b;margin-bottom:8px">🔥 Likely First Round Upsets</div>' +
      likelyUpsets.map(upsetRow).join('') +
    '</div>' : '') +
    (watchlist.length ? '<div style="margin-bottom:12px">' +
      '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#facc15;margin-bottom:8px">👀 First Round Watch List</div>' +
      watchlist.map(upsetRow).join('') +
    '</div>' : '') +

    // Fun facts
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px">' +
      '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:#60a5fa;margin-bottom:8px">📊 March Madness Facts</div>' +
      UPSET_HISTORY.fun_facts.map(f => '<div style="font-size:13px;color:#b0c4de;padding:4px 0;border-bottom:1px solid var(--border)">• '+f+'</div>').join('') +
    '</div>';
}
