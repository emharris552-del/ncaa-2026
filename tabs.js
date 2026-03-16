// tabs.js — All matchup tab renderers

const TEAM_COLORS = { a: '#3b82f6', b: '#ef4444' };

function r(val, dec=1) { return val == null ? '--' : Number(val).toFixed(dec); }
function pct(val, dec=1) { return val == null ? '--' : Number(val).toFixed(dec)+'%'; }

// ── EFFICIENCY TAB ────────────────────────────────────────
function renderEfficiency(tA, tB) {
  const grid = document.getElementById('eff-grid');
  const cards = [
    { title: 'Overall Rating', rows: [
      { label:'EvanMiya BPR',    a:r(tA.bpr,2),      b:r(tB.bpr,2),      aRaw:tA.bpr,       bRaw:tB.bpr,       rankA:tA.em_rank,      rankB:tB.em_rank,      higherBetter:true  },
      { label:'Torvik AdjEM',    a:r(tA.adj_em),      b:r(tB.adj_em),      aRaw:tA.adj_em,    bRaw:tB.adj_em,    rankA:tA.adj_em_rank,  rankB:tB.adj_em_rank,  higherBetter:true  },
      { label:'KP AdjOE',        a:r(tA.kp_adj_oe),   b:r(tB.kp_adj_oe),   aRaw:tA.kp_adj_oe, bRaw:tB.kp_adj_oe, rankA:tA.kp_adj_oe_rank, rankB:tB.kp_adj_oe_rank, higherBetter:true },
      { label:'KP AdjDE',        a:r(tA.kp_adj_de),   b:r(tB.kp_adj_de),   aRaw:tA.kp_adj_de, bRaw:tB.kp_adj_de, higherBetter:false },
    ]},
    { title: 'Offense', rows: [
      { label:'EM OBPR',         a:r(tA.obpr,2),      b:r(tB.obpr,2),      aRaw:tA.obpr,      bRaw:tB.obpr,      rankA:tA.off_rank,     rankB:tB.off_rank,     higherBetter:true  },
      { label:'Torvik AdjOE',    a:r(tA.adj_oe),      b:r(tB.adj_oe),      aRaw:tA.adj_oe,    bRaw:tB.adj_oe,    rankA:tA.adj_oe_rank,  rankB:tB.adj_oe_rank,  higherBetter:true  },
      { label:'Off eFG%',        a:pct(tA.off_efg),   b:pct(tB.off_efg),   aRaw:tA.off_efg,   bRaw:tB.off_efg,   rankA:tA.off_efg_rank, rankB:tB.off_efg_rank, higherBetter:true  },
      { label:'Off OReb%',       a:pct(tA.off_or),    b:pct(tB.off_or),    aRaw:tA.off_or,    bRaw:tB.off_or,    rankA:tA.off_or_rank,  rankB:tB.off_or_rank,  higherBetter:true  },
    ]},
    { title: 'Defense', rows: [
      { label:'EM DBPR',         a:r(tA.dbpr,2),      b:r(tB.dbpr,2),      aRaw:tA.dbpr,      bRaw:tB.dbpr,      rankA:tA.def_rank,     rankB:tB.def_rank,     higherBetter:true  },
      { label:'Torvik AdjDE',    a:r(tA.adj_de),      b:r(tB.adj_de),      aRaw:tA.adj_de,    bRaw:tB.adj_de,    rankA:tA.adj_de_rank,  rankB:tB.adj_de_rank,  higherBetter:false },
      { label:'Def eFG% Allowed',a:pct(tA.def_efg),   b:pct(tB.def_efg),   aRaw:tA.def_efg,   bRaw:tB.def_efg,   rankA:tA.def_efg_rank, rankB:tB.def_efg_rank, higherBetter:false },
      { label:'Def OReb% Allow', a:pct(tA.def_or),    b:pct(tB.def_or),    aRaw:tA.def_or,    bRaw:tB.def_or,    rankA:tA.def_or_rank,  rankB:tB.def_or_rank,  higherBetter:false },
    ]},
    { title: 'Size & Experience', rows: [
      { label:'Size Rating',     a:r(tA.size,2),      b:r(tB.size,2),      aRaw:tA.size,      bRaw:tB.size,      rankA:tA.size_rank,    rankB:tB.size_rank,    higherBetter:true  },
      { label:'Experience',      a:r(tA.exp,3),       b:r(tB.exp,3),       aRaw:tA.exp,       bRaw:tB.exp,       rankA:tA.exp_rank,     rankB:tB.exp_rank,     higherBetter:true  },
      { label:'Bench %',         a:pct(tA.bench),     b:pct(tB.bench),     aRaw:tA.bench,     bRaw:tB.bench,     higherBetter:true  },
    ]},
  ];

  grid.innerHTML = cards.map(card => {
    const rowsHtml = card.rows.map(row => {
      const aRaw = row.aRaw ?? 0, bRaw = row.bRaw ?? 0;
      const maxVal = Math.max(Math.abs(aRaw), Math.abs(bRaw)) || 1;
      const aW = Math.round((Math.abs(aRaw)/maxVal)*100);
      const bW = Math.round((Math.abs(bRaw)/maxVal)*100);
      const aWins = row.higherBetter != null && row.aRaw != null && row.bRaw != null && (row.higherBetter ? row.aRaw > row.bRaw : row.aRaw < row.bRaw);
      const bWins = row.higherBetter != null && row.aRaw != null && row.bRaw != null && (row.higherBetter ? row.bRaw > row.aRaw : row.bRaw < row.aRaw);
      return '<div class="stat-row">' +
        '<div class="stat-label">' + row.label + '</div>' +
        '<div class="stat-bars">' +
          '<div class="bar-wrap">' +
            '<span class="bar-val a" style="' + (aWins ? 'color:#4ade80;font-weight:800' : '') + '">' + row.a + '</span>' +
            '<div class="bar-track"><div class="bar-fill a" style="width:' + aW + '%"></div></div>' +
            (row.rankA ? '<span class="rank-badge">#' + row.rankA + '</span>' : '<span class="rank-badge"></span>') +
          '</div>' +
          '<div class="bar-wrap">' +
            '<span class="bar-val b" style="' + (bWins ? 'color:#4ade80;font-weight:800' : '') + '">' + row.b + '</span>' +
            '<div class="bar-track"><div class="bar-fill b" style="width:' + bW + '%"></div></div>' +
            (row.rankB ? '<span class="rank-badge">#' + row.rankB + '</span>' : '<span class="rank-badge"></span>') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    return '<div class="stat-card"><div class="stat-card-title">' + card.title + '</div>' + rowsHtml + '</div>';
  }).join('');

  renderWinSummary(tA, tB);
  renderPace(tA, tB);
}

// ── WIN PROBABILITY SUMMARY ───────────────────────────────
function renderWinSummary(tA, tB) {
  const el = document.getElementById('win-summary-section');
  if (!el) return;

  // ── CORE METRICS ─────────────────────────────────────────
  // ── IMPROVED WIN PROBABILITY ──────────────────────────────
  // Incorporates: core efficiency, shot chart matchup edge,
  // killshot margin, seed analysis, close games, ranked record

  // Shot chart matchup edge: how each team shoots vs THIS opponent's defense
  // vs how the opponent shoots vs THIS team's defense (actual head-to-head shooting edge)
  const aNetShoot = (tA.shot_off && tB.shot_def) ? tA.shot_off.efg - tB.shot_def.efg : null;
  const bNetShoot = (tB.shot_off && tA.shot_def) ? tB.shot_off.efg - tA.shot_def.efg : null;
  const shootEdgeDiff = (aNetShoot != null && bNetShoot != null) ? aNetShoot - bNetShoot : null;

  // Metrics: { name, diff (positive = favors A), w (weight), scale (for tanh normalization) }
  // scale = the difference that represents "meaningful" — tanh(1) ≈ 0.76
  const rawMetrics = [
    { name:'EvanMiya BPR',        diff: tA.bpr != null && tB.bpr != null ? tA.bpr - tB.bpr : null,                            w:3.0,  scale:8   },
    { name:'Torvik AdjEM',        diff: tA.adj_em != null && tB.adj_em != null ? tA.adj_em - tB.adj_em : null,                 w:3.0,  scale:8   },
    { name:'KP Adj Offense',      diff: tA.kp_adj_oe != null && tB.kp_adj_oe != null ? tA.kp_adj_oe - tB.kp_adj_oe : null,   w:1.5,  scale:8   },
    { name:'KP Adj Defense',      diff: tA.kp_adj_de != null && tB.kp_adj_de != null ? tB.kp_adj_de - tA.kp_adj_de : null,   w:1.5,  scale:8   },
    { name:'Shot Chart Edge',     diff: shootEdgeDiff,                                                                          w:2.0,  scale:5   },
    { name:'Win% vs Ranked',      diff: tA.ranked_win_pct != null && tB.ranked_win_pct != null ? tA.ranked_win_pct - tB.ranked_win_pct : null,  w:1.5, scale:20 },
    { name:'Close Game Win%',     diff: tA.close_games_pct != null && tB.close_games_pct != null ? tA.close_games_pct - tB.close_games_pct : null, w:1.0, scale:20 },
    { name:'Killshot Margin',     diff: tA.ks_margin != null && tB.ks_margin != null ? tA.ks_margin - tB.ks_margin : null,    w:1.5,  scale:0.5 },
    { name:'Seed Value',          diff: tA.seed_bpr_diff != null && tB.seed_bpr_diff != null ? tA.seed_bpr_diff - tB.seed_bpr_diff : null, w:0.75, scale:3 },
    { name:'Extra Chances',       diff: tA.extra_chances != null && tB.extra_chances != null ? tA.extra_chances - tB.extra_chances : null, w:0.5, scale:3 },
    { name:'Foul Trouble & FT%',  diff: tA.foul_ft_score != null && tB.foul_ft_score != null ? tA.foul_ft_score - tB.foul_ft_score : null,    w:1.0, scale:1.0 },
    { name:'Turnover Margin',     diff: tA.to_margin != null && tB.to_margin != null ? tA.to_margin - tB.to_margin : null,                        w:1.2, scale:4.0 },
    { name:'Recent Form',         diff: tA.recent_form != null && tB.recent_form != null ? tA.recent_form - tB.recent_form : null,                  w:1.0, scale:5.0 },
    { name:'3pt Reliability',     diff: tA.three_pt_reliability != null && tB.three_pt_reliability != null ? tA.three_pt_reliability - tB.three_pt_reliability : null, w:0.6, scale:3.0 },
  ];

  let totalW = 0, aScore = 0;
  const edgesA = [], edgesB = [];

  for (const m of rawMetrics) {
    if (m.diff == null) continue;
    const norm = Math.tanh(m.diff / m.scale);
    aScore += norm * m.w;
    totalW += m.w;
    // Flag meaningful edges (norm > 0.3 = ~35% above neutral)
    if (Math.abs(norm) > 0.3) {
      const edgeStr = m.name + ' (+' + Math.abs(m.diff).toFixed(1) + ')';
      if (norm > 0) edgesA.push(edgeStr);
      else          edgesB.push(edgeStr);
    }
  }

  const probA = totalW > 0 ? Math.round((1/(1+Math.exp(-(aScore/totalW)*3.5)))*100) : 50;
  const probB = 100 - probA;
  const colorA = '#60a5fa', colorB = '#f87171';

  const logoA = getLogoUrl(tA.name) ? '<img src="' + getLogoUrl(tA.name) + '" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '';
  const logoB = getLogoUrl(tB.name) ? '<img src="' + getLogoUrl(tB.name) + '" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '';

  const pillsA = edgesA.length ? edgesA.map(e => '<span class="win-edge-pill">' + e + '</span>').join('') : '<span class="win-edge-pill muted">No major edges</span>';
  const pillsB = edgesB.length ? edgesB.map(e => '<span class="win-edge-pill">' + e + '</span>').join('') : '<span class="win-edge-pill muted">No major edges</span>';

  el.innerHTML =
    '<div class="win-summary-card">' +
      '<div class="win-summary-title">Matchup Summary &amp; Win Probability</div>' +
      '<div class="win-prob-bar-wrap">' +
        '<div class="win-prob-team a">' +
          '<div class="win-prob-pct" style="color:' + colorA + '">' + probA + '%</div>' +
          '<div class="win-prob-name" style="color:' + colorA + '">' + tA.name + '</div>' +
        '</div>' +
        '<div class="win-prob-bar-track">' +
          '<div class="win-prob-fill a" style="width:' + probA + '%;background:' + colorA + '"></div>' +
          '<div class="win-prob-fill b" style="width:' + probB + '%;background:' + colorB + '"></div>' +
        '</div>' +
        '<div class="win-prob-team b">' +
          '<div class="win-prob-pct" style="color:' + colorB + '">' + probB + '%</div>' +
          '<div class="win-prob-name" style="color:' + colorB + '">' + tB.name + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="win-reasons-grid">' +
        '<div class="win-reasons-col">' +
          '<div class="win-reasons-hdr" style="color:' + colorA + '">' + logoA + ' Why ' + tA.name + ' wins</div>' +
          '<div class="win-edges">' + pillsA + '</div>' +
        '</div>' +
        '<div class="win-reasons-col">' +
          '<div class="win-reasons-hdr" style="color:' + colorB + '">' + logoB + ' Why ' + tB.name + ' wins</div>' +
          '<div class="win-edges">' + pillsB + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:#8fa3c0;margin-top:8px;text-align:center;line-height:1.6">' +
      '<strong style="color:#b0c4de">Model includes:</strong> ' +
      'BPR &amp; AdjEM (core) · KP Off/Def · ' +
      '<span style="color:#60a5fa">📊 Shot Chart edge</span> · ' +
      '<span style="color:#f59e0b">💥 Killshot</span> · ' +
      '<span style="color:#fb923c">🎯 Seed value</span> · ' +
      '<span style="color:#4ade80">🏀 Foul/FT%</span> · ' +
      '<span style="color:#a78bfa">↕ TO Margin</span> · ' +
      '<span style="color:#34d399">🔥 Recent Form</span> · ' +
      '<span style="color:#fbbf24">🎲 3pt Risk</span> · ' +
      'Ranked record · Close game%' +
    '</div>' +
      '<div class="ai-bar" style="margin-top:14px">' +
        '<button class="ai-btn" id="ai-eff-btn">&#9881; AI Matchup Analysis</button>' +
        '<div id="ai-eff-output" class="ai-output hidden"></div>' +
      '</div>' +
    '</div>';
}

// ── PACE SECTION ──────────────────────────────────────────
function renderPace(tA, tB) {
  const ps = document.getElementById('pace-section');
  const tempoA = tA.kp_adj_tempo, tempoB = tB.kp_adj_tempo;
  const paA = tA.pace_adjust, paB = tB.pace_adjust;
  const tempoGap = Math.abs((tempoA||0) - (tempoB||0));
  const fasterTeam = (tempoA||0) > (tempoB||0) ? tA.name : tB.name;
  const slowerTeam = (tempoA||0) > (tempoB||0) ? tB.name : tA.name;

  let insightText = tempoGap > 5
    ? 'Major pace conflict: <strong>' + fasterTeam + '</strong> (' + (Math.max(tempoA||0, tempoB||0)).toFixed(1) + ' poss/g) vs <strong>' + slowerTeam + '</strong> (' + (Math.min(tempoA||0, tempoB||0)).toFixed(1) + ' poss/g) — ' + tempoGap.toFixed(1) + ' possession gap. '
    : 'Similar pace teams (' + (tempoA||0).toFixed(1) + ' vs ' + (tempoB||0).toFixed(1) + ' poss/g). ';

  if (paA != null && paB != null) {
    if (paA < 0 && paB > 0)      insightText += '<strong>' + tA.name + '</strong> plays better slow (' + paA.toFixed(1) + '), <strong>' + tB.name + '</strong> benefits from pace (+' + paB.toFixed(1) + '). Tempo control is critical.';
    else if (paB < 0 && paA > 0) insightText += '<strong>' + tB.name + '</strong> prefers slow (' + paB.toFixed(1) + '), <strong>' + tA.name + '</strong> benefits from pace (+' + paA.toFixed(1) + ').';
    else                         insightText += 'Both teams prefer ' + (paA < 0 ? 'slower' : 'faster') + ' pace.';
  }

  const paceItemHtml = (label, valA, valB, rankA, rankB, fmtFn) =>
    '<div class="pace-item">' +
      '<div class="pace-item-label">' + label + '</div>' +
      '<div class="pace-item-vals">' +
        '<div><div class="pace-val a">' + (fmtFn ? fmtFn(valA) : r(valA)) + '</div><div class="pace-rank">' + (rankA != null ? '#'+rankA : '') + '</div></div>' +
        '<div><div class="pace-val b">' + (fmtFn ? fmtFn(valB) : r(valB)) + '</div><div class="pace-rank">' + (rankB != null ? '#'+rankB : '') + '</div></div>' +
      '</div>' +
    '</div>';

  const pmFmt = v => v != null ? (v > 0 ? '+' : '') + v.toFixed(1) : '--';
  const dirFmt = v => v != null ? ((v > 0 ? '+' : '') + v.toFixed(1) + (v >= 0 ? ' (fast)' : ' (slow)')) : '--';

  ps.innerHTML =
    '<div class="pace-title">Pace Analysis</div>' +
    '<div class="pace-grid">' +
      paceItemHtml('KenPom AdjTempo', tempoA, tempoB, tA.kp_adj_tempo_rank, tB.kp_adj_tempo_rank) +
      paceItemHtml('EM Pace Adjust', paA, paB, null, null, dirFmt) +
      paceItemHtml('Torvik AdjTempo', tA.tv_adj_tempo, tB.tv_adj_tempo, tA.tv_tempo_rank, tB.tv_tempo_rank) +
    '</div>' +
    '<div class="pace-insight">' + insightText + '</div>';
}

// ── FOUR FACTORS TAB ──────────────────────────────────────
function renderFourFactors(tA, tB) {
  const el = document.getElementById('ff-content');

  function ffRow(label, valA, valB, rankA, rankB, higherBetter) {
    const va = valA != null ? parseFloat(valA) : null;
    const vb = valB != null ? parseFloat(valB) : null;
    const max = Math.max(Math.abs(va||0), Math.abs(vb||0)) || 1;
    const aW = Math.round(Math.abs(va||0)/max*100);
    const bW = Math.round(Math.abs(vb||0)/max*100);
    const aWins = higherBetter != null && va != null && vb != null && (higherBetter ? va > vb : va < vb);
    const bWins = higherBetter != null && va != null && vb != null && (higherBetter ? vb > va : vb < va);
    const fv = v => v != null ? v.toFixed(1)+'%' : '--';
    return '<div class="ff-row">' +
      '<div class="ff-row-label">' + label + '</div>' +
      '<div class="ff-cell">' +
        '<span class="ff-val a" style="' + (aWins?'color:#4ade80':'') + '">' + fv(va) + '</span>' +
        '<div class="ff-bar-track"><div class="ff-bar-fill a" style="width:' + aW + '%"></div></div>' +
        (rankA ? '<span class="ff-rank">#'+rankA+'</span>' : '<span class="ff-rank"></span>') +
      '</div>' +
      '<div class="ff-cell">' +
        '<span class="ff-val b" style="' + (bWins?'color:#4ade80':'') + '">' + fv(vb) + '</span>' +
        '<div class="ff-bar-track"><div class="ff-bar-fill b" style="width:' + bW + '%"></div></div>' +
        (rankB ? '<span class="ff-rank">#'+rankB+'</span>' : '<span class="ff-rank"></span>') +
      '</div>' +
    '</div>';
  }

  const hdr = '<div class="ff-header"><span>Metric</span><span style="color:#60a5fa">' + tA.name + '</span><span style="color:#f87171">' + tB.name + '</span></div>';

  el.innerHTML =
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-bottom:12px">' +
      '<div class="ff-section-head">Offense</div>' + hdr +
      ffRow('eFG%',    tA.off_efg, tB.off_efg, tA.off_efg_rank, tB.off_efg_rank, true) +
      ffRow('TO%',     tA.off_to,  tB.off_to,  tA.off_to_rank,  tB.off_to_rank,  false) +
      ffRow('OReb%',   tA.off_or,  tB.off_or,  tA.off_or_rank,  tB.off_or_rank,  true) +
      ffRow('FT Rate', tA.off_ftr, tB.off_ftr, null,            null,            true) +
    '</div>' +
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;margin-bottom:12px">' +
      '<div class="ff-section-head">Defense</div>' + hdr +
      ffRow('Opp eFG%',  tA.def_efg, tB.def_efg, tA.def_efg_rank, tB.def_efg_rank, false) +
      ffRow('Opp TO%',   tA.def_to,  tB.def_to,  tA.def_to_rank,  tB.def_to_rank,  true) +
      ffRow('Opp OReb%', tA.def_or,  tB.def_or,  tA.def_or_rank,  tB.def_or_rank,  false) +
    '</div>';
}

// ── SHOOTING TAB ──────────────────────────────────────────
function renderShooting(tA, tB) {
  const el = document.getElementById('shooting-content');

  function sRow(label, valA, valB, higherBetter, suffix) {
    suffix = suffix || '%';
    const va = valA != null ? parseFloat(valA) : null;
    const vb = valB != null ? parseFloat(valB) : null;
    const aWins = higherBetter != null && va != null && vb != null && (higherBetter ? va > vb : va < vb);
    const bWins = higherBetter != null && va != null && vb != null && (higherBetter ? vb > va : vb < va);
    const fmt = v => v != null ? v.toFixed(1)+suffix : '--';
    return '<div class="shooting-row">' +
      '<span class="sr-val a" style="' + (aWins?'color:#4ade80;font-weight:800':'') + '">' + fmt(va) + '</span>' +
      '<span class="sr-label">' + label + '</span>' +
      '<span class="sr-val b" style="' + (bWins?'color:#4ade80;font-weight:800':'') + '">' + fmt(vb) + '</span>' +
    '</div>';
  }

  function secHdr(title) {
    return '<div class="shooting-hdr">' +
      '<span style="color:#60a5fa">' + tA.name + '</span>' +
      '<span class="shooting-hdr-title">' + title + '</span>' +
      '<span style="color:#f87171">' + tB.name + '</span>' +
    '</div>';
  }

  el.innerHTML =
    '<div class="shooting-card">' + secHdr('Shooting Splits') +
      sRow('2P%',        tA.fg2,      tB.fg2,      true) +
      sRow('3P%',        tA.fg3,      tB.fg3,      true) +
      sRow('FT%',        tA.ft,       tB.ft,       true) +
      sRow('Off eFG%',   tA.off_efg,  tB.off_efg,  true) +
    '</div>' +
    '<div class="shooting-card">' + secHdr('Opponent Shooting') +
      sRow('Opp 2P%',    tA.opp_fg2,  tB.opp_fg2,  false) +
      sRow('Opp 3P%',    tA.opp_fg3,  tB.opp_fg3,  false) +
      sRow('Def eFG%',   tA.def_efg,  tB.def_efg,  false) +
    '</div>' +
    '<div class="shooting-card">' + secHdr('Shot Selection') +
      sRow('3pt Rate',   tA.fg3_rate, tB.fg3_rate, null) +
      sRow('FT Rate',    tA.off_ftr,  tB.off_ftr,  true) +
      sRow('Block%',     tA.blk,      tB.blk,      true) +
      sRow('Steal Rate', tA.stl_rate != null ? tA.stl_rate*100 : null, tB.stl_rate != null ? tB.stl_rate*100 : null, true) +
    '</div>' +
    '<div class="shooting-card">' + secHdr('Point Distribution (Off)') +
      sRow('% Pts from 2s', tA.off_2_pct,  tB.off_2_pct,  null) +
      sRow('% Pts from 3s', tA.off_3_pct,  tB.off_3_pct,  null) +
      sRow('% Pts from FT', tA.off_ft_pct, tB.off_ft_pct, null) +
    '</div>';
}

// ── SHOT CHARTS TAB ───────────────────────────────────────
function renderShotCharts(tA, tB) {
  const colorA = '#60a5fa', colorB = '#f87171';

  // Instructions
  const instrEl = document.getElementById('shot-chart-instructions');
  if (instrEl) {
    instrEl.innerHTML =
      '<div class="shot-chart-guide">' +
        '<div class="scg-title">How to Read These Charts</div>' +
        '<div class="scg-body">' +
          '<div class="scg-item"><span class="scg-icon">🔴</span><div><strong style="color:#fff">Red zones</strong> = above D-I average shooting for that area (offense) or allowing above average (defense — red is bad on D)</div></div>' +
          '<div class="scg-item"><span class="scg-icon">🔵</span><div><strong style="color:#fff">Blue zones</strong> = below average shooting (offense) or holding below average (defense — blue is GOOD on D)</div></div>' +
          '<div class="scg-item"><span class="scg-icon">🏀</span><div><strong style="color:#fff">Numbers</strong> = FG% per zone. Basket is at top, baseline at bottom.</div></div>' +
          '<div class="scg-item"><span class="scg-icon">⚖️</span><div><strong style="color:#fff">Zone Matchup</strong> = offense% minus defense allowed%. Red = offense has edge; Blue = defense wins.</div></div>' +
          '<div class="scg-zones-legend">' +
            '<span class="scg-zone-tag">Restricted Area (layups)</span>' +
            '<span class="scg-zone-tag">Paint Floor (short 2s)</span>' +
            '<span class="scg-zone-tag">Mid-Range (outside lane)</span>' +
            '<span class="scg-zone-tag">Corner 3 (baseline)</span>' +
            '<span class="scg-zone-tag">Wing 3 (45 degrees)</span>' +
            '<span class="scg-zone-tag">Top Arc 3 (straight-on)</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function logoTag(name, col) {
    const url = getLogoUrl(name);
    return (url ? '<img src="' + url + '" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '') +
      ' <span style="color:' + col + '">' + name + '</span>';
  }

  // Offense courts
  document.getElementById('courts-offense').innerHTML =
    '<div class="court-container">' +
      '<div class="court-label">' + logoTag(tA.name, colorA) + ' Offense</div>' +
      buildCourtSVG(tA.shot_off, false, tA.name, colorA) +
    '</div>' +
    '<div class="court-container">' +
      '<div class="court-label">' + logoTag(tB.name, colorB) + ' Offense</div>' +
      buildCourtSVG(tB.shot_off, false, tB.name, colorB) +
    '</div>';

  // Defense courts
  document.getElementById('courts-defense').innerHTML =
    '<div class="court-container">' +
      '<div class="court-label">' + logoTag(tA.name, colorA) + ' Defense</div>' +
      buildCourtSVG(tA.shot_def, true, tA.name, colorA) +
    '</div>' +
    '<div class="court-container">' +
      '<div class="court-label">' + logoTag(tB.name, colorB) + ' Defense</div>' +
      buildCourtSVG(tB.shot_def, true, tB.name, colorB) +
    '</div>';

  renderZoneMatchup(tA, tB, 'A');
}

let _zmA = null, _zmB = null;

function renderZoneMatchup(tA, tB, dir) {
  _zmA = tA; _zmB = tB;
  const offTeam = dir === 'A' ? tA : tB;
  const defTeam = dir === 'A' ? tB : tA;

  document.getElementById('mt-a-ball').classList.toggle('active', dir === 'A');
  document.getElementById('mt-b-ball').classList.toggle('active', dir === 'B');

  document.getElementById('zone-matchup-court').innerHTML =
    '<div class="zm-row">' + buildMatchupCourtSVG(offTeam.shot_off, defTeam.shot_def, offTeam.name, defTeam.name) + '</div>';

  const rows = getZoneMatchupData(offTeam.shot_off, defTeam.shot_def);
  const colorOff = dir === 'A' ? '#60a5fa' : '#f87171';
  const colorDef = dir === 'A' ? '#f87171' : '#60a5fa';

  // New table: shows offense vs avg AND defense vs avg so user sees true edge
  const tableRows = rows.map(row => {
    const offEdgeStr = (row.offEdge >= 0 ? '+' : '') + row.offEdge.toFixed(1);
    const defEdgeStr = (row.defEdge >= 0 ? '+' : '') + row.defEdge.toFixed(1);
    const netStr = (row.netEdge >= 0 ? '+' : '') + row.netEdge.toFixed(1);
    // net < 0 = defense wins (offense edge < defense edge)
    const defWins = row.netEdge < 0;
    const offWins = row.netEdge > 0;
    const chipClass = Math.abs(row.netEdge) < 2 ? 'even' : (offWins ? 'off' : 'def');
    const chipText = Math.abs(row.netEdge) < 2 ? 'Even' : (offWins ? offTeam.name + ' OFF' : defTeam.name + ' DEF');
    return '<tr>' +
      '<td>' + row.label + '</td>' +
      '<td style="color:' + colorOff + '">' + row.offVal.toFixed(1) + '%' +
        ' <span style="font-size:10px;color:'+(row.offEdge>=0?'#4ade80':'#f87171')+'">('+offEdgeStr+')</span></td>' +
      '<td style="color:' + colorDef + '">' + row.defVal.toFixed(1) + '%' +
        ' <span style="font-size:10px;color:'+(row.defEdge>=0?'#4ade80':'#f87171')+'">('+defEdgeStr+')</span></td>' +
      '<td style="font-weight:700;color:'+(defWins?'#60a5fa':offWins?'#f87171':'#8fa3c0')+'">' + netStr + '</td>' +
      '<td><span class="zm-chip ' + chipClass + '">' + chipText + '</span></td>' +
    '</tr>';
  }).join('');

  document.getElementById('zone-matchup-table').innerHTML =
    '<div style="font-size:11px;color:#b0c4de;margin-bottom:6px;padding:6px 8px;background:var(--bg3);border-radius:6px">' +
      '<strong>How to read:</strong> Values in () show how each team compares to D-I average. ' +
      'Net = offense edge minus defense edge. <span style="color:#f87171">Red = offense wins zone</span>, ' +
      '<span style="color:#60a5fa">Blue = defense wins zone</span>.' +
    '</div>' +
    '<table class="zm-table"><thead><tr>' +
      '<th>Zone</th>' +
      '<th style="color:' + colorOff + '">' + offTeam.name + ' Off (vs avg)</th>' +
      '<th style="color:' + colorDef + '">' + defTeam.name + ' Def (vs avg)</th>' +
      '<th>Net Edge</th><th>Winner</th>' +
    '</tr></thead><tbody>' + tableRows + '</tbody></table>';

  if (rows.length > 0) {
    const top = rows[0];
    const defWinsZone = top.netEdge < 0;
    const winner = defWinsZone ? defTeam.name + ' defense' : offTeam.name + ' offense';
    const winColor = defWinsZone ? '#60a5fa' : '#f87171';
    const explanation = defWinsZone
      ? defTeam.name + ' holds opponents to ' + top.defVal.toFixed(1) + '% (D-I avg ' + top.avg + '%, edge: +' + top.defEdge.toFixed(1) + '%). '
        + offTeam.name + ' shoots ' + top.offVal.toFixed(1) + '% (edge vs avg: ' + (top.offEdge>=0?'+':'') + top.offEdge.toFixed(1) + '%). '
        + '<strong>Defense wins by ' + Math.abs(top.netEdge).toFixed(1) + '%.</strong>'
      : offTeam.name + ' shoots ' + top.offVal.toFixed(1) + '% (D-I avg ' + top.avg + '%, edge: +' + top.offEdge.toFixed(1) + '%). '
        + defTeam.name + ' allows ' + top.defVal.toFixed(1) + '% (edge: ' + (top.defEdge>=0?'+':'') + top.defEdge.toFixed(1) + '%). '
        + '<strong>Offense wins by ' + Math.abs(top.netEdge).toFixed(1) + '%.</strong>';
    document.getElementById('zone-insight').innerHTML =
      '<strong>Key zone: ' + top.label + '</strong> — ' +
      '<span style="color:' + winColor + '"><strong>' + winner + '</strong></span> has the decisive edge. ' +
      explanation;
  }
}

// ── ROSTER TAB ────────────────────────────────────────────
function renderRoster(tA, tB) {
  const el = document.getElementById('roster-content');
  const playersA = getPlayers(tA.name);
  const playersB = getPlayers(tB.name);

  function playerList(players, color) {
    if (!players || !players.length) return '<p style="color:#8fa3c0;font-size:13px">Player data unavailable</p>';
    return players.slice(0,6).map((p,i) =>
      '<div class="player-row">' +
        '<span class="player-rank">' + (i+1) + '</span>' +
        '<div style="flex:1">' +
          '<div class="player-name">' + p.name + '</div>' +
          '<div class="player-splits">OBPR ' + p.obpr.toFixed(2) + ' &nbsp;·&nbsp; DBPR ' + p.dbpr.toFixed(2) + ' &nbsp;·&nbsp; ' + p.poss + ' poss</div>' +
        '</div>' +
        '<span class="player-bpr" style="color:' + color + '">' + p.bpr.toFixed(2) + '</span>' +
      '</div>'
    ).join('');
  }

  function injuryList(team) {
    const inj = team.injuries || [];
    const significant = inj.filter(i => i.impact !== 'none');
    if (!significant.length) return '<div style="padding:8px 0;font-size:13px;color:#4ade80">No significant injuries reported</div>';
    const colors = {
      'OUT':       { bg:'rgba(239,68,68,0.15)',   text:'#fca5a5', dot:'#ef4444' },
      'GAME-TIME': { bg:'rgba(251,191,36,0.15)',   text:'#fde68a', dot:'#f59e0b' },
      'AVAILABLE': { bg:'rgba(74,222,128,0.12)',   text:'#86efac', dot:'#22c55e' },
    };
    return significant.map(inj => {
      const c = colors[inj.status] || colors['AVAILABLE'];
      return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;background:' + c.bg + ';border-radius:6px;margin-bottom:6px">' +
        '<span style="color:' + c.dot + ';margin-top:2px;font-size:10px">●</span>' +
        '<div>' +
          '<div style="font-size:13px;font-weight:600;color:' + c.text + '">' + inj.player +
            '<span style="font-family:Barlow Condensed,sans-serif;font-size:11px;font-weight:800;margin-left:6px;padding:1px 7px;border-radius:3px;background:' + c.dot + ';color:#000">' + inj.status + '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:#b0c4de;margin-top:2px">' + inj.note + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  const sizeRows = [
    { label:'Size Rating', a: tA.size != null ? tA.size.toFixed(2) : '--', b: tB.size != null ? tB.size.toFixed(2) : '--', rA: tA.size_rank, rB: tB.size_rank },
    { label:'Experience',  a: tA.exp  != null ? tA.exp.toFixed(3)  : '--', b: tB.exp  != null ? tB.exp.toFixed(3)  : '--', rA: tA.exp_rank,  rB: tB.exp_rank  },
    { label:'Bench Min%',  a: tA.bench!= null ? tA.bench.toFixed(1)+'%':'--', b: tB.bench!=null ? tB.bench.toFixed(1)+'%':'--' },
  ];

  el.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">' +
      '<div class="roster-card"><div class="roster-card-title" style="color:#60a5fa">Injury Report — ' + tA.name + '</div>' + injuryList(tA) + '</div>' +
      '<div class="roster-card"><div class="roster-card-title" style="color:#f87171">Injury Report — ' + tB.name + '</div>' + injuryList(tB) + '</div>' +
    '</div>' +
    '<div class="roster-grid">' +
      '<div class="roster-card"><div class="roster-card-title" style="color:#60a5fa">' + tA.name + ' — Top Players by BPR</div>' + playerList(playersA,'#60a5fa') + '</div>' +
      '<div class="roster-card"><div class="roster-card-title" style="color:#f87171">' + tB.name + ' — Top Players by BPR</div>' + playerList(playersB,'#f87171') + '</div>' +
      '<div class="roster-card"><div class="roster-card-title">Size &amp; Depth</div>' +
        sizeRows.map(row =>
          '<div class="size-row">' +
            '<span class="size-label">' + row.label + '</span>' +
            '<div class="size-vals">' +
              '<span class="size-val a">' + row.a + (row.rA ? ' <span style="color:#8fa3c0;font-size:11px">#'+row.rA+'</span>' : '') + '</span>' +
              '<span class="size-val b">' + row.b + (row.rB ? ' <span style="color:#8fa3c0;font-size:11px">#'+row.rB+'</span>' : '') + '</span>' +
            '</div>' +
          '</div>'
        ).join('') +
      '</div>' +
    '</div>';
}

// ── KILLSHOT TAB ──────────────────────────────────────────
// "Killshot" = a scoring run that breaks the game open (EvanMiya "runs")
function renderKillshot(tA, tB) {
  const el = document.getElementById('killshot-content');
  if (!el) return;

  const colorA = '#60a5fa', colorB = '#f87171';

  function logoTag(t, color) {
    const url = getLogoUrl(t.name);
    return (url ? '<img src="'+url+'" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '') +
      '<span style="color:'+color+';font-weight:700">'+t.name+'</span>';
  }

  function compHdr() {
    return '<div class="bet-comp-header" style="margin-bottom:10px">' +
      '<div class="bet-comp-team a">'+logoTag(tA,colorA)+'</div>' +
      '<div style="font-size:11px;color:#8fa3c0">vs</div>' +
      '<div class="bet-comp-team b">'+logoTag(tB,colorB)+'</div>' +
    '</div>';
  }

  function ksRow(label, valA, valB, higherBetter, fmt) {
    const va = valA != null ? parseFloat(valA) : null;
    const vb = valB != null ? parseFloat(valB) : null;
    const aW = va != null && vb != null && (higherBetter ? va > vb : va < vb);
    const bW = va != null && vb != null && (higherBetter ? vb > va : vb < va);
    const fv = v => { if(v==null) return '--'; if(fmt==='int') return Math.round(v); return v.toFixed(3); };
    return '<div class="bet-comp-row">' +
      '<div class="bet-comp-val a" style="'+(aW?'color:#4ade80;font-weight:800':'')+'">'+fv(va)+'</div>' +
      '<div class="bet-comp-label">'+label+'</div>' +
      '<div class="bet-comp-val b" style="'+(bW?'color:#4ade80;font-weight:800':'')+'">'+fv(vb)+'</div>' +
    '</div>';
  }

  // Big stat displays
  function bigStat(label, val, color, sub) {
    const fv = val != null ? parseFloat(val).toFixed(3) : '--';
    const numColor = val != null ? (parseFloat(val) > 0.5 ? '#4ade80' : parseFloat(val) > 0.2 ? '#facc15' : '#f87171') : '#8fa3c0';
    return '<div style="background:var(--bg3);border-radius:var(--radius);padding:12px;text-align:center">' +
      '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#b0c4de;margin-bottom:4px">'+label+'</div>' +
      '<div style="font-family:\'Barlow Condensed\';font-size:30px;font-weight:900;color:'+numColor+'">'+fv+'</div>' +
      (sub ? '<div style="font-size:11px;color:#8fa3c0;margin-top:2px">'+sub+'</div>' : '') +
    '</div>';
  }

  // Killshot explanation
  const explainer = '<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius);padding:12px 16px;margin-bottom:14px;font-size:13px;color:#b0c4de">' +
    '<strong style="color:#f59e0b">What is a Killshot?</strong> A "killshot" is a scoring run that decisively breaks a game open — ' +
    'a sequence where a team scores multiple consecutive baskets while holding the opponent scoreless or nearly so. ' +
    'Teams with high killshot rates have the ability to <strong>put games away</strong> with momentum swings. ' +
    'High conceded rate = vulnerable to being run off the floor.' +
  '</div>';

  const hasA = tA.ks_per_game != null;
  const hasB = tB.ks_per_game != null;

  // Stat cards for each team
  function teamKsCard(t, color) {
    if (t.ks_per_game == null) return '<div style="padding:20px;color:#8fa3c0;text-align:center">No killshot data available</div>';
    const marginColor = (t.ks_margin||0) > 0.5 ? '#4ade80' : (t.ks_margin||0) > 0 ? '#facc15' : '#f87171';
    return '<div style="border:1px solid '+color+'33;border-radius:var(--radius-lg);padding:14px;background:linear-gradient(135deg,'+color+'06,var(--bg2))">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
        logoTag(t, color) +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
        bigStat('Killshots / Game', t.ks_per_game, color, 'Runs scored') +
        bigStat('Conceded / Game', t.ks_conceded_per_game, color, 'Runs allowed') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
        bigStat('Margin / Game', t.ks_margin, color, 'Net runs') +
        bigStat('Total Killshots', t.ks_total, color, 'Season total') +
        bigStat('Total Conceded', t.ks_conceded_total, color, 'Season total') +
      '</div>' +
    '</div>';
  }

  // Field context
  const allTeams = Object.values(TEAMS_DATA).filter(t=>t.ks_per_game!=null).sort((a,b)=>(b.ks_margin||0)-(a.ks_margin||0));
  const rankA = allTeams.findIndex(t=>t.name===tA.name)+1;
  const rankB = allTeams.findIndex(t=>t.name===tB.name)+1;

  el.innerHTML =
    explainer +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">' +
      teamKsCard(tA, colorA) +
      teamKsCard(tB, colorB) +
    '</div>' +
    '<div class="bet-comp-card" style="margin-bottom:12px">' +
      '<div class="bet-section-title"><span>⚡</span> Head-to-Head Comparison</div>' +
      compHdr() +
      (rankA ? '<div style="display:flex;justify-content:space-between;font-size:11px;color:#b0c4de;margin-bottom:8px"><span>Field rank: <strong style="color:'+colorA+'">#'+rankA+'</strong></span><span>Field rank: <strong style="color:'+colorB+'">#'+rankB+'</strong></span></div>' : '') +
      ksRow('Killshots / Game',    tA.ks_per_game,          tB.ks_per_game,          true) +
      ksRow('Conceded / Game',     tA.ks_conceded_per_game, tB.ks_conceded_per_game, false) +
      ksRow('Net Margin / Game',   tA.ks_margin,            tB.ks_margin,            true) +
      ksRow('Season Total',        tA.ks_total,             tB.ks_total,             true,  'int') +
      ksRow('Season Conceded',     tA.ks_conceded_total,    tB.ks_conceded_total,    false, 'int') +
    '</div>' +
    '<div style="font-size:11px;color:#8fa3c0;padding:8px 12px;background:var(--bg2);border-radius:6px">' +
      'Killshot data from EvanMiya.com. A killshot = a decisive scoring run. ' +
      'The team with the higher net margin has a demonstrated ability to control game momentum.' +
    '</div>';
}
