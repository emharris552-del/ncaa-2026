// region_charts.js — Region Efficiency Scatter Charts

// Global slider state per region (persists across redraws)
const RC_STATE = {};

function renderRegionCharts() {
  const el = document.getElementById('region-charts-content');
  if (!el) return;

  const REGIONS = ['EAST','WEST','SOUTH','MIDWEST'];
  const REGION_COLORS = {
    EAST:    { primary:'#60a5fa', bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.25)' },
    WEST:    { primary:'#f59e0b', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)' },
    SOUTH:   { primary:'#4ade80', bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.25)' },
    MIDWEST: { primary:'#f87171', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.25)'  },
  };
  const SEED_COLORS = {
    1:'#f59e0b', 2:'#f97316', 3:'#ef4444', 4:'#e879f9',
    5:'#a78bfa', 6:'#60a5fa', 7:'#34d399', 8:'#4ade80',
    9:'#86efac', 10:'#a5f3fc', 11:'#fde68a', 12:'#fed7aa',
    13:'#fca5a5', 14:'#c4b5fd', 15:'#93c5fd', 16:'#d1d5db',
  };

  // Full field extents for slider bounds
  const GLOBAL_OE_MIN = 98, GLOBAL_OE_MAX = 134;
  const GLOBAL_DE_MIN = 86, GLOBAL_DE_MAX = 120;
  const W = 480, H = 360, PAD = 52;

  function toX(de, deMin, deMax) { return PAD + (de - deMin) / (deMax - deMin) * (W - 2*PAD); }
  function toY(oe, oeMin, oeMax) { return H - PAD - (oe - oeMin) / (oeMax - oeMin) * (H - 2*PAD); }

  function buildSvg(region, oeMin, oeMax, deMin, deMax) {
    const col = REGION_COLORS[region];
    const entries = BRACKET_DATA[region] || [];
    const regionTeams = entries.map(e => TEAMS_DATA[e.team]).filter(Boolean);

    // Gridlines
    const oeStep = (oeMax - oeMin) > 25 ? 5 : 2;
    const deStep = (deMax - deMin) > 20 ? 5 : 2;
    let grid = '';
    for (let v = Math.ceil(deMin/deStep)*deStep; v <= deMax; v += deStep) {
      const x = toX(v, deMin, deMax);
      grid += `<line x1="${x.toFixed(1)}" y1="${PAD}" x2="${x.toFixed(1)}" y2="${H-PAD}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
      grid += `<text x="${x.toFixed(1)}" y="${H-PAD+13}" text-anchor="middle" font-size="9" fill="#445566">${v.toFixed(0)}</text>`;
    }
    for (let v = Math.ceil(oeMin/oeStep)*oeStep; v <= oeMax; v += oeStep) {
      const y = toY(v, oeMin, oeMax);
      grid += `<line x1="${PAD}" y1="${y.toFixed(1)}" x2="${W-PAD}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
      grid += `<text x="${PAD-5}" y="${(y+3).toFixed(1)}" text-anchor="end" font-size="9" fill="#445566">${v.toFixed(0)}</text>`;
    }
    // Region average crosshairs (only teams in visible window)
    const vis = regionTeams.filter(t => t.adj_oe >= oeMin && t.adj_oe <= oeMax && t.adj_de >= deMin && t.adj_de <= deMax);
    if (vis.length > 1) {
      const ax = toX(vis.reduce((s,t)=>s+t.adj_de,0)/vis.length, deMin, deMax);
      const ay = toY(vis.reduce((s,t)=>s+t.adj_oe,0)/vis.length, oeMin, oeMax);
      grid += `<line x1="${ax.toFixed(1)}" y1="${PAD}" x2="${ax.toFixed(1)}" y2="${H-PAD}" stroke="rgba(255,255,255,0.13)" stroke-width="1" stroke-dasharray="4,3"/>`;
      grid += `<line x1="${PAD}" y1="${ay.toFixed(1)}" x2="${W-PAD}" y2="${ay.toFixed(1)}" stroke="rgba(255,255,255,0.13)" stroke-width="1" stroke-dasharray="4,3"/>`;
    }

    // Team dots — deduplicate play-in entries
    const seen = new Set();
    const deduped = [];
    entries.forEach(e => { if (!seen.has(e.team)) { seen.add(e.team); deduped.push(e); } });

    let dots = '';
    deduped.forEach(e => {
      const t = TEAMS_DATA[e.team];
      if (!t || !t.adj_oe || !t.adj_de) return;
      const inView = t.adj_oe >= oeMin && t.adj_oe <= oeMax && t.adj_de >= deMin && t.adj_de <= deMax;
      const opacity = inView ? '1' : '0.15';
      // Clamp to chart edge so out-of-range dots don't escape
      const cx = toX(Math.max(deMin, Math.min(deMax, t.adj_de)), deMin, deMax);
      const cy = toY(Math.max(oeMin, Math.min(oeMax, t.adj_oe)), oeMin, oeMax);
      const sc = SEED_COLORS[e.seed] || '#94a3b8';
      const r  = e.seed <= 4 ? 9 : e.seed <= 8 ? 7.5 : 6;
      const shortName = e.team.length > 12 ? e.team.split(' ')[0] : e.team;
      const lx = cx + (cx > W/2 ? -r-2 : r+2);
      const anchor = cx > W/2 ? 'end' : 'start';
      dots += `<g class="rc-dot-group" data-team="${e.team.replace(/"/g,'&quot;')}" opacity="${opacity}" style="cursor:${inView?'pointer':'default'}">`;
      dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${sc}" fill-opacity="0.9" stroke="#0d1117" stroke-width="1.5"/>`;
      dots += `<text x="${cx.toFixed(1)}" y="${(cy-r-2).toFixed(1)}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${sc}" font-family="Barlow Condensed,sans-serif">${e.seed}</text>`;
      if (inView) {
        dots += `<text x="${lx.toFixed(1)}" y="${(cy+3).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="#c8d6e5" font-family="Barlow Condensed,sans-serif">${shortName}</text>`;
      }
      dots += '</g>';
    });

    return `<svg id="rc-svg-${region}" viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">
      <text x="${W/2}" y="${H-PAD+26}" text-anchor="middle" font-size="10" fill="#8fa3c0" font-family="Barlow Condensed,sans-serif" letter-spacing="0.5">DEF EFFICIENCY (lower = better) →</text>
      <text x="${PAD-36}" y="${H/2}" text-anchor="middle" font-size="10" fill="#8fa3c0" font-family="Barlow Condensed,sans-serif" letter-spacing="0.5" transform="rotate(-90,${PAD-36},${H/2})">OFF EFFICIENCY ↑</text>
      <rect x="${PAD}" y="${PAD}" width="${W-2*PAD}" height="${H-2*PAD}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" rx="2"/>
      ${grid}${dots}
      <text x="${PAD+5}" y="${PAD+13}" font-size="8.5" fill="rgba(74,222,128,0.35)" font-family="Barlow Condensed,sans-serif" font-weight="700">ELITE BOTH ENDS</text>
      <text x="${W-PAD-5}" y="${H-PAD-5}" font-size="8.5" fill="rgba(248,113,113,0.35)" font-family="Barlow Condensed,sans-serif" font-weight="700" text-anchor="end">VULNERABLE</text>
    </svg>`;
  }

  function buildChart(region) {
    const col = REGION_COLORS[region];
    const s   = RC_STATE[region];
    return `
    <div class="rc-chart-wrap" style="border-color:${col.border};background:${col.bg}">
      <div class="rc-chart-title" style="color:${col.primary}">${region} REGION</div>
      <div class="rc-sliders">
        <div class="rc-slider-row">
          <span class="rc-slider-label">OFF</span>
          <div class="rc-slider-track">
            <input type="range" class="rc-range" id="rc-oe-min-${region}" min="${GLOBAL_OE_MIN}" max="${GLOBAL_OE_MAX}" step="1" value="${s.oeMin}" data-region="${region}" data-axis="oeMin">
            <input type="range" class="rc-range" id="rc-oe-max-${region}" min="${GLOBAL_OE_MIN}" max="${GLOBAL_OE_MAX}" step="1" value="${s.oeMax}" data-region="${region}" data-axis="oeMax">
          </div>
          <span class="rc-slider-val" id="rc-oe-val-${region}">${s.oeMin}–${s.oeMax}</span>
        </div>
        <div class="rc-slider-row">
          <span class="rc-slider-label">DEF</span>
          <div class="rc-slider-track">
            <input type="range" class="rc-range" id="rc-de-min-${region}" min="${GLOBAL_DE_MIN}" max="${GLOBAL_DE_MAX}" step="1" value="${s.deMin}" data-region="${region}" data-axis="deMin">
            <input type="range" class="rc-range" id="rc-de-max-${region}" min="${GLOBAL_DE_MIN}" max="${GLOBAL_DE_MAX}" step="1" value="${s.deMax}" data-region="${region}" data-axis="deMax">
          </div>
          <span class="rc-slider-val" id="rc-de-val-${region}">${s.deMin}–${s.deMax}</span>
        </div>
      </div>
      <div id="rc-svg-wrap-${region}">${buildSvg(region, s.oeMin, s.oeMax, s.deMin, s.deMax)}</div>
    </div>`;
  }

  // Initialise state from per-region data range (only on first render)
  REGIONS.forEach(region => {
    if (!RC_STATE[region]) {
      const rteams = (BRACKET_DATA[region]||[]).map(e => TEAMS_DATA[e.team]).filter(Boolean);
      const oes = rteams.map(t=>t.adj_oe).filter(Boolean);
      const des = rteams.map(t=>t.adj_de).filter(Boolean);
      const P = 3;
      RC_STATE[region] = {
        oeMin: Math.floor(Math.min(...oes)) - P,
        oeMax: Math.ceil(Math.max(...oes))  + P,
        deMin: Math.floor(Math.min(...des)) - P,
        deMax: Math.ceil(Math.max(...des))  + P,
      };
    }
  });

  let html = `<div class="rc-header">
    <span style="font-family:'Barlow Condensed',sans-serif;font-size:13px;color:#b0c4de">
      KenPom Adjusted Offensive vs Defensive Efficiency — drag sliders to zoom each axis. Click a dot to open in Matchup.
    </span>
  </div><div class="rc-grid">`;
  REGIONS.forEach(r => { html += buildChart(r); });
  html += `</div>
  <div style="font-size:11px;color:#556882;margin-top:8px;padding:8px 12px;background:var(--bg2);border-radius:6px">
    Dashed crosshairs = region average of visible teams. Top-left = elite both ends. Bottom-right = vulnerable.
    Seed colors: <span style="color:#f59e0b">■ 1</span> <span style="color:#f97316">■ 2</span>
    <span style="color:#ef4444">■ 3</span> <span style="color:#e879f9">■ 4</span>
    <span style="color:#a78bfa">■ 5–6</span> <span style="color:#60a5fa">■ 7–8</span>
    <span style="color:#4ade80">■ 9–10</span> <span style="color:#fde68a">■ 11–12</span>
    <span style="color:#d1d5db">■ 13–16</span>
  </div>`;

  el.innerHTML = html;

  function attachDotHandlers(container) {
    container.querySelectorAll('.rc-dot-group').forEach(g => {
      g.addEventListener('click', () => {
        if (parseFloat(g.getAttribute('opacity')||'1') < 0.5) return;
        loadTeamIntoMatchup(g.getAttribute('data-team'));
      });
      g.addEventListener('mouseenter', () => {
        if (parseFloat(g.getAttribute('opacity')||'1') < 0.5) return;
        const c = g.querySelector('circle');
        c.setAttribute('stroke','#fff'); c.setAttribute('stroke-width','2.5');
      });
      g.addEventListener('mouseleave', () => {
        const c = g.querySelector('circle');
        c.setAttribute('stroke','#0d1117'); c.setAttribute('stroke-width','1.5');
      });
    });
  }

  attachDotHandlers(el);

  el.querySelectorAll('.rc-range').forEach(input => {
    input.addEventListener('input', function() {
      const region = this.dataset.region;
      const axis   = this.dataset.axis;
      const val    = parseFloat(this.value);
      const s      = RC_STATE[region];
      const MIN_SPAN = 5;

      if (axis === 'oeMin') s.oeMin = Math.min(val, s.oeMax - MIN_SPAN);
      if (axis === 'oeMax') s.oeMax = Math.max(val, s.oeMin + MIN_SPAN);
      if (axis === 'deMin') s.deMin = Math.min(val, s.deMax - MIN_SPAN);
      if (axis === 'deMax') s.deMax = Math.max(val, s.deMin + MIN_SPAN);

      // Sync both sliders to clamped values
      document.getElementById(`rc-oe-min-${region}`).value = s.oeMin;
      document.getElementById(`rc-oe-max-${region}`).value = s.oeMax;
      document.getElementById(`rc-de-min-${region}`).value = s.deMin;
      document.getElementById(`rc-de-max-${region}`).value = s.deMax;

      document.getElementById(`rc-oe-val-${region}`).textContent = `${s.oeMin}–${s.oeMax}`;
      document.getElementById(`rc-de-val-${region}`).textContent = `${s.deMin}–${s.deMax}`;

      const wrap = document.getElementById(`rc-svg-wrap-${region}`);
      if (wrap) {
        wrap.innerHTML = buildSvg(region, s.oeMin, s.oeMax, s.deMin, s.deMax);
        attachDotHandlers(wrap);
      }
    });
  });
}
