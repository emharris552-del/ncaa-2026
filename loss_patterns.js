// loss_patterns.js — Loss Pattern Analysis for all 68 tournament teams

function renderLossPatterns() {
  const el = document.getElementById('loss-patterns-content');
  if (!el) return;

  const teams = Object.values(TEAMS_DATA)
    .filter(t => t.seed && t.record)
    .sort((a,b) => (a.seed||99) - (b.seed||99) || (a.em_rank||999) - (b.em_rank||999));

  // ── FIELD-WIDE TREND SUMMARY ──────────────────────────────
  const tagGroups = {
    'injury':       { label:'Injury-Impacted',     color:'#f87171', icon:'🩹', teams:[] },
    'three-point':  { label:'3pt Volatility Risk',  color:'#fbbf24', icon:'🎲', teams:[] },
    'turnover':     { label:'Turnover Prone',        color:'#f97316', icon:'↕',  teams:[] },
    'overseeded':   { label:'Overseeded / Fragile',  color:'#f87171', icon:'⚠️', teams:[] },
    'underseeded':  { label:'Underseeded / Danger',  color:'#4ade80', icon:'💥', teams:[] },
    'hot':          { label:'Conference Champ / Hot',color:'#60a5fa', icon:'🔥', teams:[] },
    'cold':         { label:'Cold Entry / Concern',  color:'#a78bfa', icon:'❄️', teams:[] },
    'clutch':       { label:'Clutch / Close Game Win%', color:'#34d399', icon:'⏱️', teams:[] },
    'late-peak':    { label:'Peaked at Right Time',  color:'#f59e0b', icon:'📈', teams:[] },
  };

  // Group teams by their loss tags
  for (const t of teams) {
    const tags = t.loss_tags || [];
    for (const tag of tags) {
      if (tagGroups[tag]) {
        tagGroups[tag].teams.push(t);
      }
    }
  }

  // ── TAG PILL SUMMARY CARDS ────────────────────────────────
  const tagSummaryHtml = Object.entries(tagGroups)
    .filter(([,g]) => g.teams.length > 0)
    .map(([key, g]) => {
      const pills = g.teams.slice(0,8).map(t => {
        const logo = getLogoUrl(t.name);
        return '<span class="lp-mini-pill" onclick="scrollToTeam(\'' + t.name.replace(/'/g,"\\'") + '\')" title="' + t.name + '">' +
          (logo ? '<img src="' + logo + '" style="width:18px;height:18px;border-radius:3px;object-fit:contain" onerror="this.style.display=\'none\'">' : '') +
          '<span class="seed-bg-' + Math.min(t.seed,16) + '" style="font-size:9px;padding:1px 4px;border-radius:3px;font-weight:800">' + t.seed + '</span>' +
          '</span>';
      }).join('');
      const more = g.teams.length > 8 ? '<span style="font-size:11px;color:#b0c4de">+' + (g.teams.length-8) + ' more</span>' : '';
      return '<div class="lp-tag-card" style="border-color:' + g.color + '33;background:' + g.color + '08">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">' +
          '<span style="font-size:18px">' + g.icon + '</span>' +
          '<div>' +
            '<div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:800;color:' + g.color + '">' + g.label + '</div>' +
            '<div style="font-size:11px;color:#b0c4de">' + g.teams.length + ' teams</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">' + pills + more + '</div>' +
      '</div>';
    }).join('');

  // ── INDIVIDUAL TEAM CARDS ─────────────────────────────────
  const teamCardsHtml = teams.map(t => {
    if (!t.loss_summary) return '';
    const losses = parseInt((t.record||'0-0').split('-')[1]) || 0;
    const logo = getLogoUrl(t.name);
    const tags = (t.loss_tags||[]);

    // Loss count color
    const lossColor = losses <= 3 ? '#4ade80' : losses <= 7 ? '#facc15' :
                      losses <= 11 ? '#fb923c' : '#f87171';

    const tagPills = tags.map(tag => {
      const colors = {
        'injury':'#f87171','three-point':'#fbbf24','turnover':'#f97316',
        'overseeded':'#f87171','underseeded':'#4ade80','hot':'#60a5fa',
        'cold':'#a78bfa','clutch':'#34d399','late-peak':'#f59e0b',
        'defense':'#818cf8','offense':'#f97316','schedule':'#94a3b8',
        'foul-trouble':'#fb923c','inconsistency':'#facc15'
      };
      const c = colors[tag] || '#94a3b8';
      return '<span style="font-size:10px;padding:2px 7px;background:' + c + '22;border:1px solid ' + c + '55;border-radius:4px;color:' + c + ';font-weight:600">' + tag + '</span>';
    }).join('');

    return '<div class="lp-team-card" id="lp-' + t.name.replace(/[^a-zA-Z]/g,'') + '">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        (logo ? '<img src="' + logo + '" style="width:36px;height:36px;object-fit:contain;border-radius:4px" onerror="this.style.display=\'none\'">' : '') +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<span class="seed-bg-' + Math.min(t.seed,16) + '" style="font-family:\'Barlow Condensed\';font-size:11px;font-weight:800;padding:2px 6px;border-radius:4px">' + t.seed + '</span>' +
            '<span style="font-family:\'Barlow Condensed\';font-size:17px;font-weight:800;color:#e8edf5">' + t.name + '</span>' +
            '<span style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:700;color:' + lossColor + '">' + t.record + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">' + tagPills + '</div>' +
        '</div>' +
        '<button class="lp-matchup-btn" onclick="loadTeamIntoMatchup(\'' + t.name.replace(/'/g,"\\'") + '\')">Analyze →</button>' +
      '</div>' +
      (t.loss_red_flag ? '<div class="lp-flag red">🔴 ' + t.loss_red_flag + '</div>' : '') +
      (t.loss_green_flag ? '<div class="lp-flag green">🟢 ' + t.loss_green_flag + '</div>' : '') +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div style="font-size:13px;color:#b0c4de;margin-bottom:16px;padding:10px 14px;background:var(--bg2);border-left:3px solid #60a5fa;border-radius:6px">' +
      'Loss pattern analysis for all 68 tournament teams — identifying why teams have lost and what it means for March. ' +
      'Click any team to load them into the Matchup analyzer.' +
    '</div>' +

    '<div style="font-family:\'Barlow Condensed\';font-size:16px;font-weight:800;color:#e8edf5;margin-bottom:10px">Field-Wide Loss Trends</div>' +
    '<div class="lp-tag-grid">' + tagSummaryHtml + '</div>' +

    '<div style="font-family:\'Barlow Condensed\';font-size:16px;font-weight:800;color:#e8edf5;margin:16px 0 10px">Team-by-Team Analysis</div>' +
    '<div class="lp-team-grid">' + teamCardsHtml + '</div>';

  // Click handlers
  el.querySelectorAll('.lp-matchup-btn').forEach(() => {}); // handled by inline onclick
}

function scrollToTeam(name) {
  const id = 'lp-' + name.replace(/[^a-zA-Z]/g,'');
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
