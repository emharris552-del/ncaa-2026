// bracket.js — Bracket view

function renderBracket() {
  const el = document.getElementById('bracket-regions');
  const regionOrder = ['EAST', 'WEST', 'SOUTH', 'MIDWEST'];

  el.innerHTML = regionOrder.map(region => {
    const teams = BRACKET_DATA[region];
    // Pair teams into matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
    const matchupOrder = [
      [1, 16], [8, 9], [5, 12], [4, 13],
      [6, 11], [3, 14], [7, 10], [2, 15]
    ];

    // Build seed → team map (handle multiple 11s and 16s)
    const seedMap = {};
    for (const t of teams) {
      if (!seedMap[t.seed]) seedMap[t.seed] = [];
      seedMap[t.seed].push(t);
    }

    const matchupsHtml = matchupOrder.map(([s1, s2]) => {
      const t1list = seedMap[s1] || [];
      const t2list = seedMap[s2] || [];
      // For play-in seeds, show as "Team1/Team2"
      const t1 = t1list[0];
      const t2 = t2list[0];
      if (!t1 || !t2) return '';

      const d1 = getTeam(t1.team);
      const d2 = getTeam(t2.team);

      // If multiple teams at same seed (play-in), show both
      const name1 = t1list.length > 1 ? t1list.map(t=>t.team).join('/') : t1.team;
      const name2 = t2list.length > 1 ? t2list.map(t=>t.team).join('/') : t2.team;
      const actualTeam1 = t1.team;
      const actualTeam2 = t2.team;

      return `
        <div class="bracket-matchup">
          <div class="bracket-team" data-bracket-team="${actualTeam1.replace(/"/g,'&quot;')}">
            <div class="bt-seed seed-bg-${s1}">${s1}</div>
            <div class="bt-name">${name1}</div>
            <div class="bt-record">${d1?.record ?? ''}</div>
            ${d1?.em_rank ? `<div class="bt-rank">EM #${d1.em_rank}</div>` : ''}
          </div>
          <div class="bracket-vs">vs</div>
          <div class="bracket-team" data-bracket-team="${actualTeam2.replace(/"/g,'&quot;')}">
            <div class="bt-seed seed-bg-${s2}">${s2}</div>
            <div class="bt-name">${name2}</div>
            <div class="bt-record">${d2?.record ?? ''}</div>
            ${d2?.em_rank ? `<div class="bt-rank">EM #${d2.em_rank}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="bracket-region">
        <div class="region-header ${region}">${region} REGION</div>
        ${matchupsHtml}
      </div>`;
  }).join('');

  // Click to load matchup
  el.querySelectorAll('.bracket-team').forEach(btn => {
    btn.addEventListener('click', () => {
      const teamName = btn.getAttribute('data-bracket-team');
      loadTeamIntoMatchup(teamName);
    });
  });
}

function loadTeamIntoMatchup(teamName) {
  // Switch to matchup view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-matchup').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-view="matchup"]').classList.add('active');

  // If no team A set, put it there; else put in B
  const inputA = document.getElementById('search-a');
  const inputB = document.getElementById('search-b');
  if (!window.currentTeamA) {
    inputA.value = teamName;
    selectTeam('a', teamName);
  } else if (!window.currentTeamB) {
    inputB.value = teamName;
    selectTeam('b', teamName);
  } else {
    // Replace team B
    inputB.value = teamName;
    selectTeam('b', teamName);
  }
}
