// xfactor.js — X-Factor tab

function renderXFactor(tA, tB) {
  const el = document.getElementById('xfactor-content');
  if (!el) return;

  function xRow(label, valA, valB, rankA, rankB, higherBetter, fmt) {
    const va = valA != null ? parseFloat(valA) : null;
    const vb = valB != null ? parseFloat(valB) : null;
    const max = Math.max(Math.abs(va||0), Math.abs(vb||0)) || 1;
    const aW = Math.round(Math.abs(va||0)/max*100);
    const bW = Math.round(Math.abs(vb||0)/max*100);
    const fmtVal = (v) => {
      if (v == null) return '--';
      if (fmt === 'pct') return v.toFixed(1)+'%';
      if (fmt === 'dec') return v.toFixed(2);
      if (fmt === 'int') return Math.round(v).toString();
      if (fmt === 'pm') return (v >= 0 ? '+' : '') + v.toFixed(1);
      return v.toFixed(1);
    };
    const aWins = (va != null && vb != null) && ((higherBetter === true && va > vb) || (higherBetter === false && va < vb));
    const bWins = (va != null && vb != null) && ((higherBetter === true && vb > va) || (higherBetter === false && vb < va));
    return `
      <div class="ff-row">
        <div class="ff-row-label">${label}</div>
        <div class="ff-cell">
          <span class="ff-val a" style="${aWins?'color:#4ade80':''}">${fmtVal(va)}</span>
          <div class="ff-bar-track"><div class="ff-bar-fill a" style="width:${aW}%"></div></div>
          ${rankA != null ? `<span class="ff-rank">#${Math.round(rankA)}</span>` : '<span class="ff-rank"></span>'}
        </div>
        <div class="ff-cell">
          <span class="ff-val b" style="${bWins?'color:#4ade80':''}">${fmtVal(vb)}</span>
          <div class="ff-bar-track"><div class="ff-bar-fill b" style="width:${bW}%"></div></div>
          ${rankB != null ? `<span class="ff-rank">#${Math.round(rankB)}</span>` : '<span class="ff-rank"></span>'}
        </div>
      </div>`;
  }

  function secHead(icon, title) {
    return `<div class="ff-section-head">${icon} ${title}</div>`;
  }

  function ffHdr() {
    return `<div class="ff-header" style="grid-template-columns:160px 1fr 1fr">
      <span>Metric</span>
      <span style="color:#60a5fa">${tA.name}</span>
      <span style="color:#f87171">${tB.name}</span>
    </div>`;
  }

  const paA = tA.pace_adjust, paB = tB.pace_adjust;
  const tA_t = tA.kp_adj_tempo, tB_t = tB.kp_adj_tempo;
  const gap = Math.abs((tA_t||0)-(tB_t||0));
  let tempoInsight = gap > 4
    ? `<b>Major tempo clash</b>: ${(tA_t||0)>(tB_t||0)?tA.name:tB.name} (${Math.max(tA_t||0,tB_t||0).toFixed(1)}) vs ${(tA_t||0)>(tB_t||0)?tB.name:tA.name} (${Math.min(tA_t||0,tB_t||0).toFixed(1)}) — ${gap.toFixed(1)}-possession gap. `
    : `Similar pace (${(tA_t||0).toFixed(1)} vs ${(tB_t||0).toFixed(1)} poss/g). `;
  if (paA != null && paB != null) {
    if (paA < -10 && paB > 10) tempoInsight += `<b>${tA.name}</b> is significantly better slow (${paA.toFixed(1)}), <b>${tB.name}</b> benefits from pace (+${paB.toFixed(1)}).`;
    else if (paB < -10 && paA > 10) tempoInsight += `<b>${tB.name}</b> prefers slow (${paB.toFixed(1)}), <b>${tA.name}</b> benefits from pace (+${paA.toFixed(1)}).`;
    else tempoInsight += `Both teams prefer ${(paA||0) < 0 ? 'slower' : 'faster'} pace.`;
  }

  function rankedRow(team, color) {
    const rec = team.ranked_record || '--';
    const pct = team.ranked_win_pct;
    const mov = team.ranked_mov;
    return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="color:${color};font-weight:700;min-width:100px;font-size:14px">${team.name}</span>
      <span style="font-family:Barlow Condensed,sans-serif;font-size:22px;font-weight:800;color:${color}">${rec}</span>
      <span style="color:#8fa3c0;font-size:13px">${pct != null ? pct.toFixed(1)+'% win' : ''} ${mov != null ? '· MOV '+mov.toFixed(1) : ''}</span>
    </div>`;
  }

  function halfSplits(team, color, half) {
    const prefix = half === 1 ? 'margin_1h' : 'margin_2h';
    const overall = team[prefix];
    const l3 = team[prefix+'_l3'];
    const home = team[prefix+'_home'];
    const away = team[prefix+'_away'];
    const rank = team[prefix+'_rank'];
    const fmt = v => v != null ? (parseFloat(v)>=0?'+':'')+parseFloat(v).toFixed(1) : '--';
    const valColor = (overall||0) >= 5 ? '#4ade80' : (overall||0) >= 0 ? '#facc15' : '#f87171';
    return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <span style="color:${color};font-weight:600;min-width:110px;font-size:14px">${team.name}</span>
        <span style="font-family:Barlow Condensed,sans-serif;font-size:22px;font-weight:800;color:${valColor}">${fmt(overall)}</span>
        ${rank != null ? '<span style="font-size:11px;color:#556882">#'+Math.round(rank)+'</span>' : ''}
      </div>
      <div style="display:flex;gap:16px;font-size:12px;color:#8fa3c0;padding-left:120px">
        <span>L3: <b style="color:#e8edf5">${l3||'--'}</b></span>
        <span>Home: <b style="color:#e8edf5">${home||'--'}</b></span>
        <span>Away: <b style="color:#e8edf5">${away||'--'}</b></span>
      </div>
    </div>`;
  }

  el.innerHTML = `
    <div class="xf-card">
      ${secHead('⚡','Pace & Tempo')}
      ${ffHdr()}
      ${xRow('KP AdjTempo', tA_t, tB_t, tA.kp_adj_tempo_rank, tB.kp_adj_tempo_rank, true)}
      ${xRow('Torvik AdjTempo', tA.tv_adj_tempo, tB.tv_adj_tempo, tA.tv_tempo_rank, tB.tv_tempo_rank, true)}
      ${xRow('EM Pace Adjust', paA, paB, null, null, true, 'pm')}
      <div class="pace-insight" style="margin-top:10px">${tempoInsight}</div>
    </div>

    <div class="xf-card">
      ${secHead('🏆','Win % in Close Games (within 5 pts)')}
      ${ffHdr()}
      ${xRow('Close Game Win%', tA.close_games_pct, tB.close_games_pct, tA.close_games_rank, tB.close_games_rank, true, 'pct')}
      ${xRow('L3 Close Games', tA.close_games_l3 ? parseFloat(tA.close_games_l3)*100 : null, tB.close_games_l3 ? parseFloat(tB.close_games_l3)*100 : null, null, null, true, 'pct')}
    </div>

    <div class="xf-card">
      ${secHead('🏀','Rebounding & Extra Chances')}
      ${ffHdr()}
      ${xRow('Off Reb% (Torvik)', tA.off_or, tB.off_or, tA.off_or_rank, tB.off_or_rank, true, 'pct')}
      ${xRow('Opp Off Reb% Allowed', tA.def_or, tB.def_or, tA.def_or_rank, tB.def_or_rank, false, 'pct')}
      ${xRow('TR Off Reb Rate', tA.tr_oreb != null ? tA.tr_oreb*100 : null, tB.tr_oreb != null ? tB.tr_oreb*100 : null, tA.tr_oreb_rank, tB.tr_oreb_rank, true, 'pct')}
      ${xRow('TR Opp Off Reb Allowed', tA.tr_opp_oreb != null ? tA.tr_opp_oreb*100 : null, tB.tr_opp_oreb != null ? tB.tr_opp_oreb*100 : null, tA.tr_opp_oreb_rank, tB.tr_opp_oreb_rank, false, 'pct')}
      ${xRow('Extra Chances Margin', tA.extra_chances, tB.extra_chances, tA.extra_chances_rank, tB.extra_chances_rank, true, 'pm')}
    </div>

    <div class="xf-card">
      ${secHead('🔄','Turnovers & Ball Security')}
      ${ffHdr()}
      ${xRow('Off TO% (lower=better)', tA.off_to, tB.off_to, tA.off_to_rank, tB.off_to_rank, false, 'pct')}
      ${xRow('Forced TO%', tA.def_to, tB.def_to, tA.def_to_rank, tB.def_to_rank, true, 'pct')}
      ${xRow('Steal Rate', tA.stl_rate != null ? tA.stl_rate*100 : null, tB.stl_rate != null ? tB.stl_rate*100 : null, null, null, true, 'pct')}
      ${xRow('Assist Rate', tA.ast_rate, tB.ast_rate, null, null, true, 'pct')}
    </div>

    <div class="xf-card">
      ${secHead('🚨','Foul Trouble & Free Throws')}
      ${ffHdr()}
      ${xRow('Fouls/Poss (committed)', tA.tr_fouls != null ? tA.tr_fouls*100 : null, tB.tr_fouls != null ? tB.tr_fouls*100 : null, tA.tr_fouls_rank, tB.tr_fouls_rank, false, 'pct')}
      ${xRow('Opp Fouls Drawn/Poss', tA.tr_opp_fouls != null ? tA.tr_opp_fouls*100 : null, tB.tr_opp_fouls != null ? tB.tr_opp_fouls*100 : null, tA.tr_opp_fouls_rank, tB.tr_opp_fouls_rank, true, 'pct')}
      ${xRow('FT%', tA.ft, tB.ft, null, null, true, 'pct')}
      ${xRow('FT Rate (FTA/FGA)', tA.off_ftr, tB.off_ftr, null, null, true, 'pct')}
      ${xRow('% Points from FTs', tA.off_ft_pct, tB.off_ft_pct, null, null, true, 'pct')}
      ${xRow('Block%', tA.blk, tB.blk, null, null, true, 'pct')}
      <div class="pace-insight" style="margin-top:8px">
        <strong>Composite Score:</strong>
        <span style="color:#60a5fa;font-weight:700"> ${tA.foul_ft_score != null ? (tA.foul_ft_score >= 0 ? '+' : '') + tA.foul_ft_score.toFixed(2) : '--'}</span>
        <span style="color:#8fa3c0"> vs </span>
        <span style="color:#f87171;font-weight:700">${tB.foul_ft_score != null ? (tB.foul_ft_score >= 0 ? '+' : '') + tB.foul_ft_score.toFixed(2) : '--'}</span>
        <span style="color:#b0c4de;font-size:11px"> — positive = fewer fouls committed + draws fouls + makes FTs</span>
      </div>
    </div>

    <div class="xf-card">
      ${secHead('🎖️','Record vs Ranked Opponents')}
      ${rankedRow(tA, '#60a5fa')}
      ${rankedRow(tB, '#f87171')}
      ${ffHdr()}
      ${xRow('Win % vs Ranked', tA.ranked_win_pct, tB.ranked_win_pct, null, null, true, 'pct')}
      ${xRow('MOV vs Ranked', tA.ranked_mov, tB.ranked_mov, null, null, true, 'pm')}
      ${xRow('ATS vs Ranked Cover%', tA.ats_ranked_cover, tB.ats_ranked_cover, null, null, true, 'pct')}
    </div>

    <div class="xf-card">
      ${secHead('📅','Strength of Schedule')}
      ${ffHdr()}
      ${xRow('SoS Rank (lower = harder schedule)', tA.sos_rank, tB.sos_rank, null, null, false)}
      ${xRow('SoS Rating', tA.sos_rating, tB.sos_rating, null, null, true)}
    </div>

    <div class="xf-card">
      ${secHead('📊','1st & 2nd Half Scoring Margins')}
      <div style="margin-bottom:6px;font-size:11px;color:#556882;text-transform:uppercase;letter-spacing:1px">1st Half Margin</div>
      ${halfSplits(tA, '#60a5fa', 1)}
      ${halfSplits(tB, '#f87171', 1)}
      <div style="margin:14px 0 6px;font-size:11px;color:#556882;text-transform:uppercase;letter-spacing:1px">2nd Half Margin</div>
      ${halfSplits(tA, '#60a5fa', 2)}
      ${halfSplits(tB, '#f87171', 2)}
    </div>
  `;
}

function xfPrompt(tA, tB) {
  return `Analyze X-Factor metrics for ${tA.name} vs ${tB.name} in the 2026 NCAA Tournament.

TEMPO: ${tA.name} ${tA.kp_adj_tempo ? tA.kp_adj_tempo.toFixed(1) : '--'} poss/g (#${tA.kp_adj_tempo_rank}), pace adj ${tA.pace_adjust ? tA.pace_adjust.toFixed(1) : '--'} | ${tB.name} ${tB.kp_adj_tempo ? tB.kp_adj_tempo.toFixed(1) : '--'} poss/g (#${tB.kp_adj_tempo_rank}), pace adj ${tB.pace_adjust ? tB.pace_adjust.toFixed(1) : '--'}

CLOSE GAMES: ${tA.name} ${tA.close_games_pct ? tA.close_games_pct.toFixed(1) : '--'}% (#${tA.close_games_rank}) | ${tB.name} ${tB.close_games_pct ? tB.close_games_pct.toFixed(1) : '--'}% (#${tB.close_games_rank})

EXTRA CHANCES: ${tA.name} ${tA.extra_chances ? tA.extra_chances.toFixed(1) : '--'} (#${tA.extra_chances_rank}) | ${tB.name} ${tB.extra_chances ? tB.extra_chances.toFixed(1) : '--'} (#${tB.extra_chances_rank})

TURNOVERS: ${tA.name} off TO ${tA.off_to ? tA.off_to.toFixed(1) : '--'}% / forces ${tA.def_to ? tA.def_to.toFixed(1) : '--'}% | ${tB.name} off TO ${tB.off_to ? tB.off_to.toFixed(1) : '--'}% / forces ${tB.def_to ? tB.def_to.toFixed(1) : '--'}%

RECORD VS RANKED: ${tA.name} ${tA.ranked_record || '--'} (${tA.ranked_win_pct ? tA.ranked_win_pct.toFixed(1) : '--'}% win) | ${tB.name} ${tB.ranked_record || '--'} (${tB.ranked_win_pct ? tB.ranked_win_pct.toFixed(1) : '--'}% win)

HALF MARGINS: ${tA.name} 1H: ${tA.margin_1h ? tA.margin_1h.toFixed(1) : '--'} (#${tA.margin_1h_rank}), 2H: ${tA.margin_2h ? tA.margin_2h.toFixed(1) : '--'} (#${tA.margin_2h_rank}) | ${tB.name} 1H: ${tB.margin_1h ? tB.margin_1h.toFixed(1) : '--'}, 2H: ${tB.margin_2h ? tB.margin_2h.toFixed(1) : '--'}

SoS: ${tA.name} #${tA.sos_rank} | ${tB.name} #${tB.sos_rank}

Identify the 2-3 X-factors most likely to decide this matchup. Be specific with numbers, tell me which team has the edge in each.`;
}
