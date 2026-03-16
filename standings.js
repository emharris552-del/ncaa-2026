// standings.js — Rankings table

function renderStandings() {
  const container = document.getElementById('standings-table');
  const sortMetric = document.getElementById('sort-metric').value;
  const filterRegion = document.getElementById('filter-region').value;

  let teams = Object.values(TEAMS_DATA);

  // Filter
  if (filterRegion !== 'ALL') {
    teams = teams.filter(t => t.region === filterRegion);
  }

  // Sort
  const lowerBetter = ['adj_em_rank', 'em_rank', 'kp_adj_tempo'];
  teams.sort((a, b) => {
    const va = a[sortMetric], vb = b[sortMetric];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (lowerBetter.includes(sortMetric)) return va - vb;
    return vb - va;
  });

  const regionColors = { EAST: '#60a5fa', WEST: '#f59e0b', SOUTH: '#4ade80', MIDWEST: '#fca5a5' };

  const rows = teams.map((t, i) => {
    const seedClass = `seed-bg-${Math.min(t.seed, 16)}`;
    const regionColor = regionColors[t.region] || '#8fa3c0';
    const cover = t.ats_cover;
    const coverStyle = cover ? (cover >= 55 ? 'color:#4ade80' : cover <= 45 ? 'color:#f87171' : '') : '';

    return `
      <tr>
        <td>
          <div class="stnds-team-cell" data-stnds-team="${t.name.replace(/"/g,'&quot;')}">
            <span class="stnds-rank-num">${i+1}</span>
            <span class="stnds-seed ${seedClass}">${t.seed}</span>
            <div>
              <div class="stnds-name">${t.name}</div>
              <div class="stnds-region" style="color:${regionColor}">${t.region} &middot; ${t.record}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="stat-val">${t.em_rank != null ? '#'+t.em_rank : '--'}</div>
          <div class="stat-rank-sm">${t.bpr != null ? t.bpr.toFixed(2)+' BPR' : ''}</div>
        </td>
        <td>
          <div class="stat-val">${t.adj_em_rank != null ? '#'+t.adj_em_rank : '--'}</div>
          <div class="stat-rank-sm">${t.adj_em != null ? '+'+t.adj_em.toFixed(1) : ''}</div>
        </td>
        <td>
          <div class="stat-val">${t.kp_adj_tempo != null ? t.kp_adj_tempo.toFixed(1) : '--'}</div>
          <div class="stat-rank-sm">${t.kp_adj_tempo_rank != null ? '#'+t.kp_adj_tempo_rank : ''}</div>
        </td>
        <td>
          <div class="stat-val">${t.off_efg != null ? t.off_efg.toFixed(1)+'%' : '--'}</div>
          <div class="stat-rank-sm">${t.off_efg_rank != null ? '#'+t.off_efg_rank : ''}</div>
        </td>
        <td>
          <div class="stat-val">${t.def_efg != null ? t.def_efg.toFixed(1)+'%' : '--'}</div>
          <div class="stat-rank-sm">${t.def_efg_rank != null ? '#'+t.def_efg_rank : ''}</div>
        </td>
        <td>
          <div class="stat-val" style="${coverStyle}">${cover != null ? cover.toFixed(1)+'%' : '--'}</div>
          <div class="stat-rank-sm">${t.ats_record ?? ''}</div>
        </td>
        <td>
          <button class="quick-btn" style="font-size:11px;padding:4px 10px" data-stnds-team="${t.name.replace(/"/g,'&quot;')}">Analyze</button>
        </td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="standings-table-wrap">
      <table class="stnds-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>EvanMiya</th>
            <th>Torvik AdjEM</th>
            <th>KP Tempo</th>
            <th>Off eFG%</th>
            <th>Def eFG%</th>
            <th>ATS Cover%</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  // Click handlers
  container.querySelectorAll('[data-stnds-team]').forEach(el => {
    el.addEventListener('click', () => {
      loadTeamIntoMatchup(el.getAttribute('data-stnds-team'));
    });
  });
}
