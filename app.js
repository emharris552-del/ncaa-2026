// app.js — Main application controller
// Normalise name for safe use in HTML data attributes (avoid apostrophe issues)
function safeName(name) {
  return name; // names are safe as dataset values; template literals handle them fine
}

window.currentTeamA = null;
window.currentTeamB = null;

// ── NAVIGATION ────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('view-' + btn.dataset.view).classList.add('active');

    if (btn.dataset.view === 'bracket') renderBracket();
    if (btn.dataset.view === 'standings') { if(_stSubTab==='rankings') renderStandings(); else if(_stSubTab==='seedanalysis') renderSeedAnalysis(); else if(_stSubTab==='upsethistory') renderUpsetHistory(); else if(_stSubTab==='losspatterns') renderLossPatterns(); }
    if (btn.dataset.view === 'trends') renderTrends();
    if (btn.dataset.view === 'betting') renderBettingPage();

  });
});

// ── TEAM SEARCH & SELECTION ───────────────────────────────
function setupSearch(side) {
  const input = document.getElementById(`search-${side}`);
  const dropdown = document.getElementById(`dropdown-${side}`);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) { dropdown.classList.add('hidden'); return; }

    // Normalize query for matching (strip apostrophes/dots for partial matching)
    const qNorm = q.replace(/['.]/g, '');
    const matches = ALL_TEAM_NAMES.filter(name => {
      const nameNorm = name.toLowerCase().replace(/['.]/g, '');
      return nameNorm.includes(qNorm) || name.toLowerCase().includes(q);
    }).slice(0, 12);

    if (matches.length === 0) { dropdown.classList.add('hidden'); return; }

    dropdown.innerHTML = matches.map(name => {
      const t = TEAMS_DATA[name];
      const seedClass = `seed-bg-${Math.min(t.seed||16,16)}`;
      const logoUrl = getLogoUrl(name);
      const logoHtml = logoUrl ? `<img src="${logoUrl}" class="team-logo-sm" alt="" onerror="this.style.display='none'">` : '';
      return `<div class="dropdown-item" data-team-name="${name.replace(/"/g,'&quot;')}">
        <div class="di-seed ${seedClass}">${t.seed}</div>
        ${logoHtml}
        <div class="di-name">${name}</div>
        <div class="di-region">${t.region} &middot; ${t.record}</div>
      </div>`;
    }).join('');
    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const teamName = item.getAttribute('data-team-name');
        input.value = teamName;
        dropdown.classList.add('hidden');
        selectTeam(side, teamName);
      });
    });
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length > 0) input.dispatchEvent(new Event('input'));
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function selectTeam(side, name) {
  const team = getTeam(name);
  if (!team) {
    console.error('selectTeam: team not found for', name);
    return;
  }

  if (side === 'a') window.currentTeamA = team;
  else window.currentTeamB = team;

  // Update pill
  const pill = document.getElementById(`team-${side}-pill`);
  pill.className = 'team-pill set';
  const pillLogo = getLogoUrl(team.name);
  pill.innerHTML = `
    ${pillLogo ? `<img src="${pillLogo}" class="pill-logo" alt="" onerror="this.style.display='none'">` : ''}
    <span class="pill-seed seed-bg-${Math.min(team.seed||16,16)}">${team.seed}</span>
    <span class="pill-name">${team.name}</span>
    <span class="pill-region">${team.region}</span>
    <span class="pill-record">${team.record}</span>`;

  if (window.currentTeamA && window.currentTeamB) {
    renderMatchup(window.currentTeamA, window.currentTeamB);
    wireEffAIButton();
    if (document.getElementById('view-betting').classList.contains('active')) {
      renderBettingPage();
    }
  }
}

// ── SWAP BUTTON ───────────────────────────────────────────
document.getElementById('swap-btn').addEventListener('click', () => {
  const tA = window.currentTeamA, tB = window.currentTeamB;
  if (!tA || !tB) return;

  window.currentTeamA = tB;
  window.currentTeamB = tA;

  document.getElementById('search-a').value = tB.name;
  document.getElementById('search-b').value = tA.name;

  selectTeam('a', tB.name);
  selectTeam('b', tA.name);
});

// ── RENDER MATCHUP ────────────────────────────────────────
function renderMatchup(tA, tB) {
  document.getElementById('matchup-placeholder').classList.add('hidden');
  document.getElementById('matchup-content').classList.remove('hidden');

  // Team header cards
  renderTeamHeader('header-a', tA, '#60a5fa');
  renderTeamHeader('header-b', tB, '#f87171');

  // Render active tab
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'efficiency';
  renderTab(activeTab, tA, tB);
}

function getTeamBadges(t) {
  if (!t) return [];
  const seed = t.seed || 16;
  const diff = t.seed_bpr_diff || 0;
  const form = t.recent_form || 0;
  const inj  = t.injury_score || 0;
  const conf = t.conf_tourney_result || '';
  const adj_oe = t.adj_oe_rank || 999;
  const adj_de = t.adj_de_rank || 999;
  const off_efg = t.off_efg || 0;
  const def_efg = t.def_efg || 99;
  const tempo_rank = t.kp_adj_tempo_rank || 0;
  const adj_em = t.adj_em_rank || 999;
  const badges = [];

  // Seed analysis
  if (seed <= 12) {
    if (diff >= 3.0)       badges.push({ icon:'⬆️', label:'VERY UNDERSEEDED', color:'#f59e0b', tip:`+${diff.toFixed(1)} BPR above seed avg — historically advances 59% further` });
    else if (diff >= 1.5)  badges.push({ icon:'⬆️', label:'UNDERSEEDED',      color:'#fb923c', tip:`+${diff.toFixed(1)} BPR above seed avg — better than seed suggests` });
    else if (diff <= -3.0 && seed <= 10) badges.push({ icon:'⬇️', label:'OVERSEEDED', color:'#f87171', tip:`${diff.toFixed(1)} BPR below seed avg — significant upset risk` });
    else if (diff <= -2.0 && seed <= 10) badges.push({ icon:'⬇️', label:'OVERSEEDED', color:'#f87171', tip:`${diff.toFixed(1)} BPR below seed avg — weaker than seed` });
  }

  // Cinderella
  if (seed >= 11 && adj_em <= 80)
    badges.push({ icon:'SLIPPER', label:'CINDERELLA', color:'#38bdf8', tip:`#${adj_em} AdjEM — elite analytics for a ${seed}-seed` });

  // Injuries
  if (inj <= -4)      badges.push({ icon:'🩹', label:'INJURY CONCERN', color:'#f87171', tip:`${t.injury_count} key players out/questionable` });
  else if (inj <= -2) badges.push({ icon:'🩹', label:'INJURED',        color:'#fb923c', tip:`${t.injury_count} player(s) out or questionable` });

  // Momentum
  if (conf === 'won' && seed <= 8)
    badges.push({ icon:'🏆', label:'CONF CHAMP', color:'#f59e0b', tip:'Won conference tournament — entering hot' });
  else if (conf === 'won' && seed >= 9 && form > 1)
    badges.push({ icon:'📈', label:'PEAKING', color:'#4ade80', tip:'Won conf tourney + positive recent form' });

  if (form > 3 && seed <= 11 && conf !== 'won')
    badges.push({ icon:'🔥', label:'HOT', color:'#ef4444', tip:`Recent form +${form.toFixed(1)} — playing best basketball lately` });
  else if (form < -6 && seed <= 8)
    badges.push({ icon:'❄️', label:'COLD', color:'#60a5fa', tip:`Recent form ${form.toFixed(1)} — struggling entering tournament` });

  // Playing style
  if (adj_oe <= 20 && adj_de <= 20)
    badges.push({ icon:'⚔️', label:'TWO-WAY', color:'#34d399', tip:`Top-20 offense (#${adj_oe}) AND defense (#${adj_de})` });
  else if (off_efg >= 55 && seed <= 8)
    badges.push({ icon:'🎯', label:'ELITE OFF', color:'#60a5fa', tip:`${off_efg.toFixed(1)}% eFG — elite shooting team` });
  else if (def_efg < 46 && seed <= 8)
    badges.push({ icon:'🔒', label:'LOCKDOWN',  color:'#a78bfa', tip:`${def_efg.toFixed(1)}% opp eFG — elite defensive team` });

  if (tempo_rank >= 290 && seed <= 10)
    badges.push({ icon:'🐢', label:'SLOW PACE', color:'#e879f9', tip:`#${tempo_rank} tempo — game control, under lean` });

  return badges.slice(0, 4);
}

function renderTeamHeader(elId, team, color) {
  const el = document.getElementById(elId);
  const logoUrl = getLogoUrl(team.name);
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" class="team-logo" alt="${team.name}" onerror="this.style.display='none'">`
    : '';
  const badges = getTeamBadges(team);
  const SLIPPER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="16" height="10" style="display:inline;vertical-align:middle;margin-right:2px"><path d="M58 28c-1-4-4-7-8-8L34 16c-4-1-8-5-8-9V5c0-1-1-2-2-2s-2 1-2 2v2c0 5 3 9 7 11l16 4c3 1 5 3 6 6l1 3H10c-2 0-4 1-5 3l-1 2h54l-1-6z" fill="#38bdf8" opacity="0.95"/><path d="M24 7c0 4 3 8 7 9" stroke="#7dd3fc" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M57 26l3-3" stroke="#fde047" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M55 22l1-3" stroke="#fde047" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M60 29l3 1" stroke="#fde047" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`;
  const badgeHtml = badges.length
    ? `<div class="th-badges">\${badges.map(b => {
        const iconHtml = b.icon === 'SLIPPER' ? SLIPPER_SVG : b.icon + ' ';
        return \`<span class="th-badge-pill" style="background:\${b.color}22;border-color:\${b.color}66;color:\${b.color}" title="\${b.tip}">\${iconHtml}\${b.label}</span>\`;
      }).join('')}</div>`
    : '';
  el.innerHTML = `
    <div class="th-logo-name">
      ${logoHtml}
      <div>
        <div class="th-seed-name">
          <span class="th-seed seed-bg-${Math.min(team.seed||16,16)}">${team.seed} seed</span>
          <span class="th-name" style="color:${color}">${team.name}</span>
        </div>
        <div class="th-meta">
          <span class="th-badge">${team.region}</span>
          <span class="th-badge">${team.record}</span>
          ${team.em_rank ? `<span class="th-badge gold">EM #${team.em_rank}</span>` : ''}
          ${team.adj_em_rank ? `<span class="th-badge blue">Torvik #${team.adj_em_rank}</span>` : ''}
          ${team.kp_adj_tempo ? `<span class="th-badge">${team.kp_adj_tempo.toFixed(1)} poss/g (#${team.kp_adj_tempo_rank})</span>` : ''}
        </div>
      </div>
      ${badgeHtml}
    </div>`;
}

// ── TAB SWITCHING ─────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (window.currentTeamA && window.currentTeamB) {
      renderTab(btn.dataset.tab, window.currentTeamA, window.currentTeamB);
    }
  });
});

// Sub-tabs (shot charts)
document.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sub-tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('subtab-' + btn.dataset.subtab).classList.add('active');
  });
});

// Zone matchup toggle
document.getElementById('mt-a-ball').addEventListener('click', () => {
  if (window.currentTeamA && window.currentTeamB)
    renderZoneMatchup(window.currentTeamA, window.currentTeamB, 'A');
});
document.getElementById('mt-b-ball').addEventListener('click', () => {
  if (window.currentTeamA && window.currentTeamB)
    renderZoneMatchup(window.currentTeamA, window.currentTeamB, 'B');
});

function renderTab(tab, tA, tB) {
  switch (tab) {
    case 'efficiency':   renderEfficiency(tA, tB); break;
    case 'fourfactors':  renderFourFactors(tA, tB); break;
    case 'shooting':     renderShooting(tA, tB); break;
    case 'shotcharts':   renderShotCharts(tA, tB); break;
    case 'roster':       renderRoster(tA, tB); break;
    case 'xfactor':      renderXFactor(tA, tB); break;
    case 'killshot':     renderKillshot(tA, tB); break;
  }
}

// ── QUICK PICKS ───────────────────────────────────────────
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tA = btn.dataset.a, tB = btn.dataset.b;
    if (tA && tB) {
      document.getElementById('search-a').value = tA;
      document.getElementById('search-b').value = tB;
      selectTeam('a', tA);
      selectTeam('b', tB);
    }
  });
});

// ── AI ANALYSIS ───────────────────────────────────────────
async function callClaude(prompt) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || 'No response';
  } catch (e) {
    return 'Error calling API: ' + e.message;
  }
}

function setupAIButton(btnId, outputId, promptFn) {
  const btn = document.getElementById(btnId);
  const output = document.getElementById(outputId);
  btn.addEventListener('click', async () => {
    if (!window.currentTeamA || !window.currentTeamB) return;
    btn.disabled = true;
    btn.textContent = '⚙ Analyzing...';
    output.classList.remove('hidden');
    output.innerHTML = '<span class="ai-loading">Generating analysis...</span>';
    const prompt = promptFn(window.currentTeamA, window.currentTeamB);
    const result = await callClaude(prompt);
    output.textContent = result;
    btn.disabled = false;
    btn.textContent = '⚙ AI Matchup Analysis';
  });
}

function effPrompt(tA, tB) {
  return `You are a college basketball analyst. Analyze this NCAA Tournament matchup with sharp, specific insights.

${tA.name} (${tA.seed} seed, ${tA.region}) vs ${tB.name} (${tB.seed} seed, ${tB.region})

KEY STATS:
${tA.name}: EvanMiya rank #${tA.em_rank}, BPR ${tA.bpr?.toFixed(2)}, Torvik AdjEM ${tA.adj_em?.toFixed(1)} (#${tA.adj_em_rank}), AdjOE ${tA.adj_oe?.toFixed(1)}, AdjDE ${tA.adj_de?.toFixed(1)}, Tempo ${tA.kp_adj_tempo?.toFixed(1)} poss/g (#${tA.kp_adj_tempo_rank}), Pace Adjust: ${tA.pace_adjust?.toFixed(1)}
${tB.name}: EvanMiya rank #${tB.em_rank}, BPR ${tB.bpr?.toFixed(2)}, Torvik AdjEM ${tB.adj_em?.toFixed(1)} (#${tB.adj_em_rank}), AdjOE ${tB.adj_oe?.toFixed(1)}, AdjDE ${tB.adj_de?.toFixed(1)}, Tempo ${tB.kp_adj_tempo?.toFixed(1)} poss/g (#${tB.kp_adj_tempo_rank}), Pace Adjust: ${tB.pace_adjust?.toFixed(1)}

Give a sharp 3-4 paragraph analysis covering: overall balance of power (BPR/AdjEM), offensive/defensive matchup keys, pace dynamics, and the killshot/momentum edge. Include how each team's seed value (underseeded vs overseeded) affects tournament expectations. Be specific with numbers, not generic.`;
}

function ffPrompt(tA, tB) {
  return `Analyze the four factors for this NCAA Tournament matchup: ${tA.name} vs ${tB.name}.

${tA.name} OFFENSE: eFG% ${tA.off_efg?.toFixed(1)}% (#${tA.off_efg_rank}), TO% ${tA.off_to?.toFixed(1)}% (#${tA.off_to_rank}), OReb% ${tA.off_or?.toFixed(1)}% (#${tA.off_or_rank}), FTR ${tA.off_ftr?.toFixed(1)}
${tA.name} DEFENSE: Opp eFG% ${tA.def_efg?.toFixed(1)}% (#${tA.def_efg_rank}), Opp TO% ${tA.def_to?.toFixed(1)}% (#${tA.def_to_rank}), Opp OReb% ${tA.def_or?.toFixed(1)}% (#${tA.def_or_rank})

${tB.name} OFFENSE: eFG% ${tB.off_efg?.toFixed(1)}% (#${tB.off_efg_rank}), TO% ${tB.off_to?.toFixed(1)}% (#${tB.off_to_rank}), OReb% ${tB.off_or?.toFixed(1)}% (#${tB.off_or_rank}), FTR ${tB.off_ftr?.toFixed(1)}
${tB.name} DEFENSE: Opp eFG% ${tB.def_efg?.toFixed(1)}% (#${tB.def_efg_rank}), Opp TO% ${tB.def_to?.toFixed(1)}% (#${tB.def_to_rank}), Opp OReb% ${tB.def_or?.toFixed(1)}% (#${tB.def_or_rank})

Analyze the four factors head-to-head: where does each team have an edge? What's the most critical factor in this matchup? Which team's offense vs. which team's defense is the defining clash? Be direct and analytical.`;
}


setupAIButton('ai-ff-btn', 'ai-ff-output', ffPrompt);
setupAIButton('ai-xf-btn', 'ai-xf-output', xfPrompt);

// ai-eff-btn is rendered dynamically inside win-summary-section
// so we wire it after each matchup render
function wireEffAIButton() {
  const btn = document.getElementById('ai-eff-btn');
  const out = document.getElementById('ai-eff-output');
  if (!btn || !out) return;
  btn.addEventListener('click', async function() {
    if (!window.currentTeamA || !window.currentTeamB) return;
    this.disabled = true; this.textContent = '⚙ Analyzing...';
    out.classList.remove('hidden');
    out.innerHTML = '<span class="ai-loading">Generating analysis...</span>';
    const result = await callClaude(effPrompt(window.currentTeamA, window.currentTeamB));
    out.textContent = result;
    this.disabled = false; this.textContent = '⚙ AI Matchup Analysis';
  });
}

// ── STANDINGS CONTROLS ────────────────────────────────────
document.getElementById('sort-metric').addEventListener('change', () => {
  if (document.getElementById('view-standings').classList.contains('active')) renderStandings();
});
document.getElementById('filter-region').addEventListener('change', () => {
  if (document.getElementById('view-standings').classList.contains('active')) renderStandings();
});

// ── STANDINGS SUB-NAV ─────────────────────────────────────
let _stSubTab = 'rankings';
document.querySelectorAll('[data-stnav]').forEach(btn => {
  btn.addEventListener('click', () => {
    _stSubTab = btn.getAttribute('data-stnav');
    document.querySelectorAll('[data-stnav]').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.stnav-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('stnav-' + _stSubTab);
    if (panel) panel.classList.add('active');
    if (_stSubTab === 'rankings')     renderStandings();
    if (_stSubTab === 'seedanalysis') renderSeedAnalysis();
    if (_stSubTab === 'upsethistory') renderUpsetHistory();
    if (_stSubTab === 'losspatterns') renderLossPatterns();
  });
});

// ── INIT ──────────────────────────────────────────────────
setupSearch('a');
setupSearch('b');

// Default: load Duke vs UConn on page load
// Set globals first, then trigger render via selectTeam
window.currentTeamA = null;
window.currentTeamB = null;
document.getElementById('search-a').value = 'Duke';
document.getElementById('search-b').value = 'UConn';
selectTeam('a', 'Duke');
selectTeam('b', 'UConn');
// Pre-render My Bracket

