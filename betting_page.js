// betting_page.js — Two sub-tabs: Betting Analysis (matchup) + Quick Hits (field-wide)

let _betSubTab = 'analysis'; // 'analysis' or 'quickhits'

function renderBettingPage() {
  const el = document.getElementById('betting-page-content');

  // Set nav HTML first so bet-sub-content exists when renderBetSubTab runs
  el.innerHTML =
    '<div class="bet-sub-nav">' +
      '<button class="bet-sub-btn' + (_betSubTab==='analysis'?' active':'') + '" data-bettab="analysis">📊 Betting Analysis</button>' +
      '<button class="bet-sub-btn' + (_betSubTab==='quickhits'?' active':'') + '" data-bettab="quickhits">⚡ Quick Hits</button>' +
    '</div>' +
    '<div id="bet-sub-content"></div>';

  // Wire sub-tab buttons (now that they exist in DOM)
  el.querySelectorAll('[data-bettab]').forEach(btn => {
    btn.addEventListener('click', () => {
      _betSubTab = btn.getAttribute('data-bettab');
      el.querySelectorAll('[data-bettab]').forEach(b => b.classList.toggle('active', b === btn));
      renderBetSubTab();
    });
  });

  // Now render the active sub-tab into bet-sub-content
  renderBetSubTab();
}

function switchBetTab(tab) {
  _betSubTab = tab;
  // Update buttons
  document.querySelectorAll('.bet-sub-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab==='analysis'?'betting':'quick'));
  });
  renderBetSubTab();
}

function renderBetSubTab() {
  const el = document.getElementById('bet-sub-content');
  if (!el) return;
  if (_betSubTab === 'analysis') renderBetAnalysis(el);
  else renderBetQuickHits(el);
}

// ── BETTING ANALYSIS (matchup view) ──────────────────────
function renderBetAnalysis(el) {
  const tA = window.currentTeamA;
  const tB = window.currentTeamB;

  if (!tA || !tB) {
    el.innerHTML = '<div style="padding:40px;text-align:center;color:#8fa3c0">Select two teams in the Matchup tab first.</div>';
    return;
  }

  const colorA = '#60a5fa', colorB = '#f87171';

  function regionColor(r) {
    return {EAST:'#60a5fa',WEST:'#f59e0b',SOUTH:'#4ade80',MIDWEST:'#fca5a5'}[r]||'#8fa3c0';
  }

  function teamCard(t, color) {
    const logo = getLogoUrl(t.name) ? '<img src="'+getLogoUrl(t.name)+'" class="team-logo" alt="" onerror="this.style.display=\'none\'">' : '';
    const cc = t.ats_cover >= 55 ? '#4ade80' : t.ats_cover >= 50 ? '#facc15' : t.ats_cover != null ? '#f87171' : '#8fa3c0';
    return '<div class="bet-team-card" style="border-color:'+color+'33;background:linear-gradient(135deg,'+color+'08,var(--bg2))">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' + logo +
        '<div><div style="font-family:\'Barlow Condensed\';font-size:24px;font-weight:900;color:'+color+'">'+t.name+'</div>' +
        '<div style="font-size:12px;color:#b0c4de;margin-top:3px"><span style="color:'+regionColor(t.region)+'">'+t.region+'</span> · '+t.record+'</div></div>' +
      '</div>' +
      '<div class="bet-kv-grid">' +
        kv('ATS Record', t.ats_record||'--', color) +
        kv('Cover %', t.ats_cover!=null?t.ats_cover.toFixed(1)+'%':'--', cc) +
        kv('ATS +/-', t.ats_pm!=null?(t.ats_pm>=0?'+':'')+t.ats_pm.toFixed(1):'--', (t.ats_pm||0)>=0?'#4ade80':'#f87171') +
        kv('O/U Record', t.ou_record||'--', color) +
        kv('Over %', t.over_pct!=null?t.over_pct.toFixed(1)+'%':'--', (t.over_pct||0)>=55?'#fb923c':'#8fa3c0') +
        kv('Total +/-', t.ou_pm!=null?(t.ou_pm>=0?'+':'')+t.ou_pm.toFixed(1):'--', (t.ou_pm||0)>=0?'#fb923c':'#a78bfa') +
      '</div>' +
    '</div>';
  }

  function kv(label, val, vc) {
    return '<div class="bet-kv"><div class="bet-kv-label">'+label+'</div><div class="bet-kv-val" style="color:'+vc+'">'+val+'</div></div>';
  }

  function compHdr() {
    const la = getLogoUrl(tA.name), lb = getLogoUrl(tB.name);
    return '<div class="bet-comp-header">' +
      '<div class="bet-comp-team a">'+(la?'<img src="'+la+'" class="team-logo-sm" alt="">':'')+'<span style="color:'+colorA+';font-weight:700">'+tA.name+'</span></div>' +
      '<div style="font-size:11px;color:#8fa3c0">vs</div>' +
      '<div class="bet-comp-team b"><span style="color:'+colorB+';font-weight:700">'+tB.name+'</span>'+(lb?'<img src="'+lb+'" class="team-logo-sm" alt="">':'')+'</div>' +
    '</div>';
  }

  function crow(label, rawA, rawB, hiBetter, fmt) {
    const va = rawA!=null?parseFloat(rawA):null;
    const vb = rawB!=null?parseFloat(rawB):null;
    const aW = hiBetter!=null&&va!=null&&vb!=null&&(hiBetter?va>vb:va<vb);
    const bW = hiBetter!=null&&va!=null&&vb!=null&&(hiBetter?vb>va:vb<va);
    function fv(v,raw){ if(raw==null)return'--'; if(fmt==='rec')return String(raw); if(fmt==='pct')return v.toFixed(1)+'%'; if(fmt==='pm')return(v>=0?'+':'')+v.toFixed(1); return v.toFixed(1); }
    return '<div class="bet-comp-row">' +
      '<div class="bet-comp-val a" style="'+(aW?'color:#4ade80;font-weight:800':'')+'">'+(aW?'▲ ':'')+fv(va,rawA)+'</div>' +
      '<div class="bet-comp-label">'+label+'</div>' +
      '<div class="bet-comp-val b" style="'+(bW?'color:#4ade80;font-weight:800':'')+'">'+fv(vb,rawB)+(bW?' ▲':'')+'</div>' +
    '</div>';
  }

  function secTitle(icon, title, sub) {
    return '<div class="bet-section-title"><span class="bet-section-icon">'+icon+'</span> '+title+(sub?'<span class="bet-section-sub">'+sub+'</span>':'')+'</div>';
  }

  // Half margin card
  function halfCard(half) {
    const pf = 'margin_'+half+'h';
    const icon = half===1?'🏁':'🏆';
    function srow(lbl, sfx) {
      const ra=tA[pf+sfx], rb=tB[pf+sfx];
      const fa=ra!=null?parseFloat(ra):null, fb=rb!=null?parseFloat(rb):null;
      const aW=fa!=null&&fb!=null&&fa>fb, bW=fa!=null&&fb!=null&&fb>fa;
      const fmt=v=>v!=null?(v>=0?'+':'')+v.toFixed(1):'--';
      const ca=fa!=null?(fa>=5?'#4ade80':fa>=0?'#facc15':'#f87171'):'#8fa3c0';
      const cb=fb!=null?(fb>=5?'#4ade80':fb>=0?'#facc15':'#f87171'):'#8fa3c0';
      return '<div class="bet-comp-row">' +
        '<div class="bet-comp-val a" style="color:'+ca+';'+(aW?'font-weight:800':'')+'">'+fmt(fa)+'</div>' +
        '<div class="bet-comp-label">'+lbl+'</div>' +
        '<div class="bet-comp-val b" style="color:'+cb+';'+(bW?'font-weight:800':'')+'">'+fmt(fb)+'</div>' +
      '</div>';
    }
    return '<div class="bet-comp-card">' +
      secTitle(icon, (half===1?'1st':'2nd')+' Half Margin', half===1?'Key for first half bets':'Closing strength / backdoor covers') +
      compHdr() +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:#b0c4de;margin-bottom:6px">' +
        '<span>Rank: <strong style="color:'+colorA+'">#'+Math.round(tA[pf+'_rank']||0)+'</strong></span>' +
        '<span>Rank: <strong style="color:'+colorB+'">#'+Math.round(tB[pf+'_rank']||0)+'</strong></span>' +
      '</div>' +
      srow('Season Avg','') + srow('Last 3','_l3') + srow('Home','_home') + srow('Away','_away') +
    '</div>';
  }

  // Pace projection
  function paceCard() {
    const ap = ((tA.kp_adj_tempo||67)+(tB.kp_adj_tempo||67))/2;
    const lbl = ap<64?'Very Slow — Strong Under':ap<66?'Slow — Under lean':ap<68?'Average — play the number':ap<70?'Fast — Over lean':'Very Fast — Strong Over';
    const pc  = ap<64?'#a78bfa':ap<66?'#c4b5fd':ap<68?'#facc15':ap<70?'#fb923c':'#ef4444';
    const gap = Math.abs((tA.kp_adj_tempo||67)-(tB.kp_adj_tempo||67));
    const slower = (tA.kp_adj_tempo||67)<(tB.kp_adj_tempo||67)?tA:tB;
    const slColor = slower===tA?colorA:colorB;
    const paceNote = gap>4
      ? '<div class="pace-insight" style="margin-top:8px;font-size:12px"><strong style="color:'+slColor+'">'+slower.name+'</strong> likely controls tempo ('+gap.toFixed(1)+' poss/g gap) — lean <strong>Under</strong>.</div>'
      : '<div class="pace-insight" style="margin-top:8px;font-size:12px">Similar pace — game flow will be consistent. Watch the opening minutes.</div>';
    return '<div class="bet-comp-card">' +
      secTitle('⚡','Pace &amp; Total Projection','Combined tempo creates an over/under lean') +
      compHdr() +
      crow('KP Tempo', tA.kp_adj_tempo, tB.kp_adj_tempo, true) +
      crow('Tempo Rank', tA.kp_adj_tempo_rank, tB.kp_adj_tempo_rank, false) +
      crow('Pace Adjust', tA.pace_adjust, tB.pace_adjust, true,'pm') +
      crow('Over %', tA.over_pct, tB.over_pct, true,'pct') +
      crow('Under %', tA.under_pct, tB.under_pct, true,'pct') +
      '<div style="margin-top:10px;padding:10px;background:'+pc+'18;border:1px solid '+pc+'44;border-radius:8px;text-align:center">' +
        '<div style="font-family:\'Barlow Condensed\';font-size:13px;font-weight:800;color:'+pc+'">'+ap.toFixed(1)+' avg poss/g</div>' +
        '<div style="font-size:12px;color:'+pc+'">'+lbl+'</div>' +
      '</div>' + paceNote +
    '</div>';
  }

  el.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">' +
      teamCard(tA,colorA) + teamCard(tB,colorB) +
    '</div>' +
    '<div class="bet-comp-card" style="margin-bottom:12px">' +
      secTitle('📊','Against the Spread','') + compHdr() +
      crow('ATS Record',tA.ats_record,tB.ats_record,null,'rec') +
      crow('Cover %',tA.ats_cover,tB.ats_cover,true,'pct') +
      crow('ATS MOV',tA.ats_mov,tB.ats_mov,true,'pm') +
      crow('ATS +/-',tA.ats_pm,tB.ats_pm,true,'pm') +
    '</div>' +
    '<div class="bet-comp-card" style="margin-bottom:12px">' +
      secTitle('🔥','Over/Under','') + compHdr() +
      crow('O/U Record',tA.ou_record,tB.ou_record,null,'rec') +
      crow('Over %',tA.over_pct,tB.over_pct,true,'pct') +
      crow('Under %',tA.under_pct,tB.under_pct,true,'pct') +
      crow('Total +/-',tA.ou_pm,tB.ou_pm,true,'pm') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
      halfCard(1) + halfCard(2) +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
      '<div class="bet-comp-card">' +
        secTitle('🎖️','ATS vs Ranked','') + compHdr() +
        crow('ATS vs Ranked',tA.ats_ranked_record,tB.ats_ranked_record,null,'rec') +
        crow('Cover% vs Ranked',tA.ats_ranked_cover,tB.ats_ranked_cover,true,'pct') +
        crow('Win% vs Ranked',tA.ranked_win_pct,tB.ranked_win_pct,true,'pct') +
        crow('MOV vs Ranked',tA.ranked_mov,tB.ranked_mov,true,'pm') +
      '</div>' +
      paceCard() +
    '</div>' +
    '<div class="bet-comp-card" style="border-color:rgba(167,139,250,0.3)">' +
      '<div class="ai-bar">' +
        '<button class="ai-btn" id="ai-bet-btn">⚙ AI Betting Analysis</button>' +
        '<div id="ai-bet-output" class="ai-output hidden"></div>' +
      '</div>' +
    '</div>';

  document.getElementById('ai-bet-btn').addEventListener('click', async function() {
    this.disabled=true; this.textContent='⚙ Analyzing...';
    const out=document.getElementById('ai-bet-output');
    out.classList.remove('hidden');
    out.innerHTML='<span class="ai-loading">Generating...</span>';
    const res=await callClaude(betPrompt(tA,tB));
    out.textContent=res;
    this.disabled=false; this.textContent='⚙ AI Betting Analysis';
  });
}

// ── QUICK HITS (field-wide) ───────────────────────────────
function renderBetQuickHits(el) {
  const teams = Object.values(TEAMS_DATA);

  function regionColor(r) {
    return {EAST:'#60a5fa',WEST:'#f59e0b',SOUTH:'#4ade80',MIDWEST:'#fca5a5'}[r]||'#8fa3c0';
  }

  function teamPill(t, detail, color) {
    const logo = getLogoUrl(t.name) ? '<img src="'+getLogoUrl(t.name)+'" class="team-logo-sm" alt="" onerror="this.style.display=\'none\'">' : '';
    const sc = 'seed-bg-'+Math.min(t.seed||16,16);
    return '<div class="qh-pill" data-qh-team="'+t.name.replace(/"/g,'&quot;')+'">' +
      logo +
      '<span class="'+sc+'" style="font-family:\'Barlow Condensed\';font-size:10px;font-weight:800;width:18px;height:18px;border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+t.seed+'</span>' +
      '<span style="font-weight:600;font-size:13px">'+t.name+'</span>' +
      (detail?'<span style="font-size:11px;color:'+(color||'#b0c4de')+'">'+detail+'</span>':'') +
    '</div>';
  }

  function qhCard(icon, title, sub, teamList) {
    if (!teamList.length) return '';
    return '<div class="qh-card">' +
      '<div class="qh-card-title"><span>'+icon+'</span><div><div style="font-family:\'Barlow Condensed\';font-size:15px;font-weight:800">'+title+'</div><div style="font-size:11px;color:#b0c4de;margin-top:2px">'+sub+'</div></div></div>' +
      '<div class="qh-pill-wrap">'+teamList.join('')+'</div>' +
    '</div>';
  }

  // Best covers (≥55%)
  const bestCovers = teams.filter(t=>t.ats_cover>=55).sort((a,b)=>b.ats_cover-a.ats_cover)
    .map(t=>teamPill(t, t.ats_cover.toFixed(1)+'%', '#4ade80'));

  // Fade candidates (<45%)
  const fadeTeams = teams.filter(t=>t.ats_cover!=null&&t.ats_cover<45).sort((a,b)=>a.ats_cover-b.ats_cover)
    .map(t=>teamPill(t, t.ats_cover.toFixed(1)+'%', '#f87171'));

  // Over machines (over% ≥55%)
  const overTeams = teams.filter(t=>t.over_pct>=55).sort((a,b)=>b.over_pct-a.over_pct)
    .map(t=>teamPill(t, t.over_pct.toFixed(1)+'% over', '#fb923c'));

  // Under machines (over% <45%)
  const underTeams = teams.filter(t=>t.over_pct!=null&&t.over_pct<45).sort((a,b)=>a.over_pct-b.over_pct)
    .map(t=>teamPill(t, t.under_pct!=null?t.under_pct.toFixed(1)+'% under':'', '#a78bfa'));

  // Slow pace (potential unders)
  const slowPace = teams.filter(t=>t.kp_adj_tempo_rank>=280&&t.seed<=10).sort((a,b)=>b.kp_adj_tempo_rank-a.kp_adj_tempo_rank)
    .map(t=>teamPill(t, t.kp_adj_tempo?.toFixed(1)+' pos/g', '#c4b5fd'));

  // Fast pace (potential overs)
  const fastPace = teams.filter(t=>t.kp_adj_tempo_rank&&t.kp_adj_tempo_rank<=60&&t.seed<=12).sort((a,b)=>a.kp_adj_tempo_rank-b.kp_adj_tempo_rank)
    .map(t=>teamPill(t, t.kp_adj_tempo?.toFixed(1)+' pos/g', '#fb923c'));

  // Strong ATS vs ranked
  const ranked = teams.filter(t=>t.ats_ranked_cover!=null&&t.ats_ranked_cover>=55&&t.seed<=10).sort((a,b)=>b.ats_ranked_cover-a.ats_ranked_cover)
    .map(t=>teamPill(t, t.ats_ranked_cover.toFixed(1)+'% vs ranked', '#4ade80'));

  // Big 2H closers (margin_2h_rank <= 15)
  const closers = teams.filter(t=>t.margin_2h_rank&&t.margin_2h_rank<=15&&t.seed<=8).sort((a,b)=>a.margin_2h_rank-b.margin_2h_rank)
    .map(t=>teamPill(t, '+'+t.margin_2h?.toFixed(1)+' 2H margin', '#60a5fa'));

  // Strong 1H leaders
  const h1leaders = teams.filter(t=>t.margin_1h_rank&&t.margin_1h_rank<=15&&t.seed<=8).sort((a,b)=>a.margin_1h_rank-b.margin_1h_rank)
    .map(t=>teamPill(t, '+'+t.margin_1h?.toFixed(1)+' 1H margin', '#f59e0b'));

  // Extra chances dominators
  const extraChances = teams.filter(t=>t.extra_chances_rank&&t.extra_chances_rank<=20&&t.seed<=10).sort((a,b)=>(a.extra_chances_rank||99)-(b.extra_chances_rank||99))
    .map(t=>teamPill(t, '+'+t.extra_chances?.toFixed(1)+' extra', '#4ade80'));

  el.innerHTML =
    '<div class="qh-note">Click any team to load them into the Matchup &amp; Betting Analysis tabs.</div>' +
    '<div class="qh-grid">' +
      qhCard('▲','Best ATS Cover Rate','Covering the spread consistently this season — back these teams', bestCovers) +
      qhCard('▼','Fade Candidates','These teams cover less than 45% — laying points has been profitable', fadeTeams) +
      qhCard('🔥','Over Machines','Games go over the total 55%+ of the time — target totals', overTeams) +
      qhCard('❄️','Under Merchants','Games consistently stay under — target low totals', underTeams) +
      qhCard('🐢','Slow-Pace Teams (Under lean)','Bottom-25% nationally in tempo. When two meet: bet the under. When vs fast team: still lean under.', slowPace) +
      qhCard('🚀','Fast-Pace Teams (Over lean)','Top-60 nationally in tempo. High-scoring games more likely. When two fast teams meet: bet the over.', fastPace) +
      qhCard('🎖️','ATS Warriors vs Ranked','Covering 55%+ against ranked opponents — battle-tested and reliable', ranked) +
      qhCard('🏆','2nd Half Closers','Top-15 nationally in 2nd half scoring margin — great for live betting and backdoor covers', closers) +
      qhCard('🏁','1st Half Dominators','Top-15 in 1st half margin — consider first half lines', h1leaders) +
    '</div>';

  // Click to load into matchup
  el.querySelectorAll('[data-qh-team]').forEach(el2 => {
    el2.addEventListener('click', () => loadTeamIntoMatchup(el2.getAttribute('data-qh-team')));
  });
}

function betPrompt(tA, tB) {
  return 'You are a sharp sports betting analyst. Analyze this NCAA Tournament matchup from a betting angle.\n\n' +
    tA.name+' vs '+tB.name+'\n\n' +
    'ATS: '+tA.name+' '+tA.ats_record+' ('+tA.ats_cover?.toFixed(1)+'% cover) | '+tB.name+' '+tB.ats_record+' ('+tB.ats_cover?.toFixed(1)+'% cover)\n' +
    'vs Ranked: '+tA.name+' '+tA.ats_ranked_record+' ('+tA.ats_ranked_cover?.toFixed(1)+'%) | '+tB.name+' '+tB.ats_ranked_record+' ('+tB.ats_ranked_cover?.toFixed(1)+'%)\n' +
    'O/U: '+tA.name+' Over '+tA.over_pct?.toFixed(1)+'% | '+tB.name+' Over '+tB.over_pct?.toFixed(1)+'%\n' +
    '1H Margin: '+tA.name+' +'+tA.margin_1h?.toFixed(1)+' (#'+tA.margin_1h_rank+') | '+tB.name+' +'+tB.margin_1h?.toFixed(1)+' (#'+tB.margin_1h_rank+')\n' +
    '2H Margin: '+tA.name+' +'+tA.margin_2h?.toFixed(1)+' (#'+tA.margin_2h_rank+') | '+tB.name+' +'+tB.margin_2h?.toFixed(1)+' (#'+tB.margin_2h_rank+')\n' +
    'Pace: '+tA.name+' '+tA.kp_adj_tempo?.toFixed(1)+' poss/g (#'+tA.kp_adj_tempo_rank+') | '+tB.name+' '+tB.kp_adj_tempo?.toFixed(1)+' poss/g (#'+tB.kp_adj_tempo_rank+')\n\n' +
    'Provide 4 sharp paragraphs: (1) spread angle, (2) over/under lean, (3) first/second half betting angles, (4) single key number driving your analysis.';
}
