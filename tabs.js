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


// ── KEYS TO THE GAME ─────────────────────────────────────
function generateKeysToGame(team, opp) {
  const wins = [], loses = [];

  // ── WIN CONDITIONS ────────────────────────────────────────
  // Efficiency edge
  if (team.bpr != null && opp.bpr != null) {
    const diff = team.bpr - opp.bpr;
    if (diff >= 4) wins.push({ text: 'Dominant overall rating edge (BPR +' + diff.toFixed(1) + ') — superior talent on both ends of the floor', s: diff });
    else if (diff >= 1.5) wins.push({ text: 'Efficiency advantage (BPR +' + diff.toFixed(1) + ') — consistently outperforms opponents at this level', s: diff });
  }

  // Shot chart matchup
  if (team.shot_off && opp.shot_def) {
    const net = team.shot_off.efg - opp.shot_def.efg;
    if (net >= 4) wins.push({ text: 'Favorable zone shooting matchup — shoots ' + team.shot_off.efg.toFixed(1) + '% eFG vs ' + opp.name + '\'s ' + opp.shot_def.efg.toFixed(1) + '% allowed', s: net });
    else if (net >= 2) wins.push({ text: 'Zone-by-zone shooting edge (+' + net.toFixed(1) + '% eFG advantage in shot chart matchup)', s: net });
  }

  // Killshot / momentum runs
  if (team.ks_margin != null && opp.ks_margin != null) {
    const diff = team.ks_margin - opp.ks_margin;
    if (diff >= 0.3) wins.push({ text: 'Controls momentum — killshot margin +' + diff.toFixed(3) + '/g means ' + team.name + ' regularly puts games away with decisive scoring runs', s: diff * 12 });
    else if (diff >= 0.15) wins.push({ text: 'Edge in game-breaking runs (+' + diff.toFixed(3) + '/g killshot margin) — capable of blowing close games open', s: diff * 12 });
  }

  // Defense
  if (team.def_efg != null && opp.def_efg != null) {
    const diff = opp.def_efg - team.def_efg;
    if (diff >= 4) wins.push({ text: 'Elite defense (' + team.def_efg.toFixed(1) + '% opp eFG) shuts down scoring — ' + diff.toFixed(1) + '% tighter than ' + opp.name + '\' defense', s: diff });
    else if (diff >= 2) wins.push({ text: 'Defensive edge (' + team.def_efg.toFixed(1) + '% opp eFG vs ' + opp.def_efg.toFixed(1) + '%) — forces opponents into tough shots', s: diff });
  }

  // TO margin
  if ((team.to_margin||0) >= 5) {
    wins.push({ text: 'Turnover machine — net +' + (team.to_margin).toFixed(1) + '% margin means extra possessions every game. Aggressive defense will test ' + opp.name + '\' ball handlers', s: team.to_margin });
  } else if (team.to_margin != null && opp.to_margin != null && (team.to_margin - opp.to_margin) >= 4) {
    wins.push({ text: 'Ball security edge — TO margin ' + (team.to_margin - opp.to_margin).toFixed(1) + '% better than opponent translates to extra possessions', s: team.to_margin - opp.to_margin });
  }

  // Foul/FT
  if (team.foul_ft_score != null && opp.foul_ft_score != null && (team.foul_ft_score - opp.foul_ft_score) >= 1.2) {
    wins.push({ text: 'Free throw advantage — gets to the line (' + (team.off_ftr||0).toFixed(1) + '% FT rate) and converts (' + (team.ft||0).toFixed(1) + '%), while ' + opp.name + ' commits more fouls', s: (team.foul_ft_score - opp.foul_ft_score) * 3 });
  }

  // Clutch
  if ((team.close_games_pct||0) >= 68 && (team.close_games_pct||0) > (opp.close_games_pct||50) + 15) {
    wins.push({ text: 'Elite clutch performer (' + (team.close_games_pct).toFixed(0) + '% close game win rate) — thrives in the tight, pressure-filled games March demands', s: team.close_games_pct - 50 });
  }

  // Underseeded
  if ((team.seed_bpr_diff||0) >= 2.0) {
    wins.push({ text: 'Underseeded by ' + (team.seed_bpr_diff).toFixed(1) + ' BPR points — far better than their seed line suggests. Historically these teams advance 59% further', s: team.seed_bpr_diff * 2 });
  }

  // Hot form
  if (team.conf_tourney_result === 'won' && (opp.conf_tourney_result !== 'won')) {
    wins.push({ text: 'Conference tournament champion — enters on a winning streak, battle-tested and peaking at the right time', s: 5 });
  }

  // Opponent injuries
  if ((opp.injury_score||0) <= -4) {
    const outs = (opp.injuries_list||[]).filter(i=>i.status==='Out').map(i=>i.player);
    wins.push({ text: opp.name + ' depleted by injuries (' + outs.slice(0,2).join(', ') + ' Out) — depth gaps and disrupted chemistry create exploitable mismatches', s: Math.abs(opp.injury_score) });
  }

  // Green flag from loss analysis
  if (team.loss_green_flag && team.loss_green_flag.length > 10) {
    wins.push({ text: team.loss_green_flag, s: 3 });
  }

  // Opp 3pt fragility
  if ((opp.three_pt_reliability||0) <= -4 && (opp.fg3_rate||0) >= 48) {
    wins.push({ text: opp.name + ' lives and dies by the three (' + (opp.fg3_rate).toFixed(0) + '% shot rate) — pressure the perimeter and one cold night eliminates them', s: 5 });
  }

  // Rebounding
  if ((team.off_or||0) >= 38 && (team.extra_chances||0) > 3) {
    wins.push({ text: 'Second-chance machine — ' + (team.off_or).toFixed(1) + '% offensive rebound rate generates ' + (team.extra_chances).toFixed(1) + ' extra chances per game over opponent', s: team.off_or - 30 });
  }

  // ── LOSS CONDITIONS ───────────────────────────────────────
  // Own injuries
  if ((team.injury_score||0) <= -4) {
    const outs = (team.injuries_list||[]).filter(i=>i.status==='Out').map(i=>i.player);
    const qs = (team.injuries_list||[]).filter(i=>i.status==='Questionable').map(i=>i.player);
    const names = outs.map(n=>n+' (Out)').concat(qs.map(n=>n+' (Q)')).slice(0,3);
    loses.push({ text: 'Injury concerns entering tournament — ' + names.join(', ') + '. Reduced depth and disrupted rotations at the worst possible time', s: Math.abs(team.injury_score) });
  }

  // 3pt dependency
  if ((team.three_pt_reliability||0) <= -4 && (team.fg3_rate||0) >= 48) {
    loses.push({ text: '3-point dependent offense (' + (team.fg3_rate).toFixed(0) + '% shot rate, reliability score ' + (team.three_pt_reliability).toFixed(1) + ') — tournament defenses close out hard and one cold night ends the run', s: Math.abs(team.three_pt_reliability) });
  }

  // Cold form
  if ((team.recent_form||0) <= -5) {
    const ctNote = ({ early: ' — early conf tourney exit', quarters: ' — lost in conf quarters', semi: ' — lost in conf semis' })[team.conf_tourney_result] || '';
    loses.push({ text: 'Cold entering tournament (form ' + (team.recent_form).toFixed(1) + ')' + ctNote + ' — negative momentum and potential unresolved problems from late-season losses', s: Math.abs(team.recent_form) });
  }

  // Overseeded
  if ((team.seed_bpr_diff||0) <= -3.0) {
    loses.push({ text: 'Overseeded — BPR is ' + Math.abs(team.seed_bpr_diff).toFixed(1) + ' pts below seed expectation. Faces opponents who may be equally or more talented despite lower seeds', s: Math.abs(team.seed_bpr_diff) });
  }

  // TO liability
  if ((team.to_margin||0) < -1.5 || (team.off_to||0) >= 18) {
    loses.push({ text: 'Turnover prone — ' + ((team.off_to||0) >= 18 ? 'gives ball away on ' + (team.off_to).toFixed(1) + '% of possessions' : 'negative TO margin ' + (team.to_margin||0).toFixed(1) + '%') + '. Press defenses will force chaos', s: Math.max(Math.abs(team.to_margin||0), 3) });
  }

  // Foul trouble
  if ((team.foul_ft_score||0) <= -1.2) {
    loses.push({ text: 'Foul trouble risk — commits ' + ((team.tr_fouls||0)*100).toFixed(1) + '% of possessions in fouls. Key players in foul trouble is a recurring theme that derails their games', s: Math.abs(team.foul_ft_score||0) * 2 });
  }

  // Close game failures
  if ((team.close_games_pct||50) < 42 && (team.close_games_pct||50) > 0) {
    loses.push({ text: 'Poor clutch record — wins only ' + (team.close_games_pct).toFixed(0) + '% of close games. March Madness rewards teams who can execute in the final 5 minutes', s: 50 - team.close_games_pct });
  }

  // Defensive issues
  if ((team.def_efg||0) >= 50) {
    loses.push({ text: 'Defense allows ' + (team.def_efg).toFixed(1) + '% opp eFG — bottom half of the tournament field. Elite offenses will find rhythm quickly and score at will', s: team.def_efg - 46 });
  }

  // Opponent shot chart advantage
  if (team.shot_def && opp.shot_off) {
    const netDef = opp.shot_off.efg - team.shot_def.efg;
    if (netDef >= 5) loses.push({ text: opp.name + ' exploits the shooting matchup — ' + opp.name + ' shoots ' + opp.shot_off.efg.toFixed(1) + '% eFG vs ' + team.name + '\'s ' + team.shot_def.efg.toFixed(1) + '% allowed. Favorable zone-by-zone for the opponent', s: netDef });
  }

  // Pace mismatch vulnerability
  if (team.kp_adj_tempo != null && opp.kp_adj_tempo != null) {
    const diff = opp.kp_adj_tempo - team.kp_adj_tempo;
    if (diff >= 8) loses.push({ text: 'Pace mismatch — ' + opp.name + ' plays ' + diff.toFixed(0) + ' poss/g faster. Being pushed into an up-tempo game exposes ' + team.name + '\'s weaknesses in transition defense', s: diff * 0.8 });
  }

  // Red flag from loss analysis
  if (team.loss_red_flag && team.loss_red_flag.length > 10) {
    loses.push({ text: team.loss_red_flag, s: 4 });
  }

  wins.sort((a,b) => b.s - a.s);
  loses.sort((a,b) => b.s - a.s);

  return { wins: wins.slice(0, 3), loses: loses.slice(0, 3) };
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
    { name:'Injury Impact',        diff: (tA.injury_score != null && tB.injury_score != null) ? (tA.injury_score - tB.injury_score) : null, w:1.0, scale:2.0 },
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

  // Pre-compute Keys to the Game
  const keysA = generateKeysToGame(tA, tB);
  const keysB = generateKeysToGame(tB, tA);

  function ktgBullet(item, color) {
    return '<li><span style="color:' + color + ';font-weight:700">→ </span>' + item.text + '</li>';
  }
  const ktgHtml =
    '<div class="keys-to-game">' +
      '<div class="ktg-title">🔑 Keys to the Game</div>' +
      '<div class="ktg-grid">' +
        '<div class="ktg-col">' +
          '<div class="ktg-team-hdr" style="color:' + colorA + '">' +
            (getLogoUrl(tA.name) ? '<img src="' + getLogoUrl(tA.name) + '" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '') +
            ' ' + tA.name +
          '</div>' +
          '<div class="ktg-section">' +
            '<div class="ktg-section-hdr win">✅ How they WIN</div>' +
            '<ul class="ktg-list">' + (keysA.wins.length ? keysA.wins.map(i=>ktgBullet(i,colorA)).join('') : '<li style="color:#8fa3c0;font-size:12px">Calculating...</li>') + '</ul>' +
          '</div>' +
          '<div class="ktg-section">' +
            '<div class="ktg-section-hdr lose">⚠️ How they LOSE</div>' +
            '<ul class="ktg-list">' + (keysA.loses.length ? keysA.loses.map(i=>ktgBullet(i,'#f87171')).join('') : '<li style="color:#8fa3c0;font-size:12px">Calculating...</li>') + '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="ktg-col">' +
          '<div class="ktg-team-hdr" style="color:' + colorB + '">' +
            (getLogoUrl(tB.name) ? '<img src="' + getLogoUrl(tB.name) + '" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '') +
            ' ' + tB.name +
          '</div>' +
          '<div class="ktg-section">' +
            '<div class="ktg-section-hdr win">✅ How they WIN</div>' +
            '<ul class="ktg-list">' + (keysB.wins.length ? keysB.wins.map(i=>ktgBullet(i,colorB)).join('') : '<li style="color:#8fa3c0;font-size:12px">Calculating...</li>') + '</ul>' +
          '</div>' +
          '<div class="ktg-section">' +
            '<div class="ktg-section-hdr lose">⚠️ How they LOSE</div>' +
            '<ul class="ktg-list">' + (keysB.loses.length ? keysB.loses.map(i=>ktgBullet(i,'#f87171')).join('') : '<li style="color:#8fa3c0;font-size:12px">Calculating...</li>') + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

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
      '<span style="color:#f87171">🩹 Injuries</span> · ' +
      'Ranked record · Close game%' +
    '</div>' +
      ktgHtml +
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

  function playerList(players, color, teamInjuries) {
    if (!players || !players.length) return '<p style="color:#8fa3c0;font-size:13px">Player data unavailable</p>';
    // Build injury lookup by last name (Covers uses "P. McCollum" style)
    const injMap = {};
    (teamInjuries || []).forEach(function(inj) {
      const lastName = inj.player.split(' ').pop().toLowerCase();
      injMap[lastName] = inj;
    });
    return players.slice(0,8).map(function(p,i) {
      const pos = p.pos || '?';
      const lastName = p.name.split(' ').pop().toLowerCase();
      const injData = injMap[lastName];
      const injBadge = injData
        ? ' <span style="font-size:9px;font-weight:800;padding:1px 5px;border-radius:3px;background:' +
          (injData.status==='Out' ? '#ef444433' : '#f59e0b33') + ';color:' +
          (injData.status==='Out' ? '#f87171' : '#facc15') + ';border:1px solid ' +
          (injData.status==='Out' ? '#f8717166' : '#facc1566') + '">' +
          injData.status.toUpperCase() + '</span>'
        : '';
      return '<div class="player-row">' +
        '<span class="player-rank">' + (i+1) + '</span>' +
        '<div style="flex:1">' +
          '<div class="player-name">' + p.name +
            ' <span style="font-size:10px;font-weight:700;color:#8fa3c0;background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px">' + pos + '</span>' +
            injBadge +
          '</div>' +
          '<div class="player-splits">OFF ' + p.obpr.toFixed(2) + ' &nbsp;·&nbsp; DEF ' + p.dbpr.toFixed(2) + ' &nbsp;·&nbsp; ' + p.poss + ' poss</div>' +
        '</div>' +
        '<span class="player-bpr" style="color:' + color + '">' + p.bpr.toFixed(2) + '</span>' +
      '</div>';
    }).join('');
  }

  function injuryList(team) {
    // Use injuries_list (live Covers.com data) not old injuries field
    const rawList = team.injuries_list || team.injuries || [];
    // Convert new format to display format
    const injuries = rawList.map(function(inj) {
      return {
        player: inj.player || inj.name || '?',
        position: inj.pos || inj.position || '',
        injury: inj.injury || inj.type || 'Undisclosed',
        status: inj.status || 'Questionable',
        impact: null
      };
    });
    if (!injuries.length) {
      return '<div style="padding:8px 0;font-size:13px;color:#4ade80">✓ No injuries reported</div>';
    }
    function statusStyle(status) {
      if (!status) return { bg:'rgba(74,222,128,0.12)', text:'#86efac', dot:'#22c55e', badge:'#22c55e' };
      const s = status.toUpperCase();
      if (s.includes('OUT FOR SEASON') || s.includes('SEASON-ENDING'))
        return { bg:'rgba(239,68,68,0.15)', text:'#fca5a5', dot:'#ef4444', badge:'#ef4444' };
      if (s.includes('OUT'))
        return { bg:'rgba(239,68,68,0.12)', text:'#fca5a5', dot:'#ef4444', badge:'#ef4444' };
      if (s.includes('QUESTIONABLE') || s.includes('DOUBTFUL'))
        return { bg:'rgba(251,191,36,0.12)', text:'#fde68a', dot:'#f59e0b', badge:'#f59e0b' };
      if (s.includes('EXPECTED') || s.includes('AVAILABLE'))
        return { bg:'rgba(74,222,128,0.10)', text:'#86efac', dot:'#22c55e', badge:'#22c55e' };
      return { bg:'rgba(148,163,184,0.10)', text:'#cbd5e1', dot:'#94a3b8', badge:'#94a3b8' };
    }
    const alertColor = team.alert_level === 'critical' ? '#ef4444' :
                       team.alert_level === 'high' ? '#f97316' :
                       team.alert_level === 'medium' ? '#f59e0b' : '#22c55e';
    let html = '';
    if (team.injury_summary) {
      html += '<div style="margin-bottom:8px;padding:8px 10px;background:' + alertColor + '18;border-left:3px solid ' + alertColor + ';border-radius:4px;font-size:12px;color:#e8edf5">' + team.injury_summary + '</div>';
    }
    html += injuries.map(inj => {
      const c = statusStyle(inj.status);
      const badgeText = (inj.status||'').split('—')[0].trim() || inj.status;
      return '<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:' + c.bg + ';border-radius:6px;margin-bottom:6px">' +
        '<span style="color:' + c.dot + ';margin-top:3px;font-size:12px">●</span>' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">' +
            '<span style="font-size:13px;font-weight:700;color:' + c.text + '">' + inj.player + '</span>' +
            (inj.position ? '<span style="font-size:10px;color:#8fa3c0">' + inj.position + '</span>' : '') +
            (inj.stats ? '<span style="font-size:10px;color:#8fa3c0">' + inj.stats + '</span>' : '') +
          '</div>' +
          '<div style="font-size:12px;color:#b0c4de;margin-bottom:3px"><strong>' + (inj.injury||'') + '</strong></div>' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
            '<span style="font-family:Barlow Condensed,sans-serif;font-size:10px;font-weight:800;padding:1px 7px;border-radius:3px;background:' + c.badge + ';color:#000">' + badgeText + '</span>' +
          '</div>' +
          (inj.impact ? '<div style="font-size:11px;color:#94a3b8;line-height:1.4">' + inj.impact + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');
    return html;
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
      '<div class="roster-card"><div class="roster-card-title" style="color:#60a5fa">' + tA.name + ' — Top Players by BPR</div>' + playerList(playersA,'#60a5fa',tA.injuries_list) + '</div>' +
      '<div class="roster-card"><div class="roster-card-title" style="color:#f87171">' + tB.name + ' — Top Players by BPR</div>' + playerList(playersB,'#f87171',tB.injuries_list) + '</div>' +
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
