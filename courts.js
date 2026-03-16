// courts.js — Shot chart renderer
// Orientation matches CBBAnalytics: basket at TOP, baseline at top edge, mid-court at bottom.
// The 3pt arc is a large semicircle whose endpoints (corner 3 lines) are near the TOP
// and whose bottom (top-of-arc zone) is near the BOTTOM of the SVG.
// Corner 3 = close to basket (top), Top Arc 3 = far from basket (bottom center).

const CW = 420, CH = 420;
const BX = CW / 2;   // 210
const BY = 30;        // basket y (near top, like CBBAnalytics)

// Lane (key)
const LANE_W  = 100;
const LANE_H  = 160;
const LANE_X1 = BX - LANE_W / 2;  // 160
const LANE_X2 = BX + LANE_W / 2;  // 260
const LANE_TOP = BY - 4;           // just above basket
const LANE_BOT = BY + LANE_H;      // 190 = FT line

// Circles
const RA_R = 34;
const FT_R = 60;

// 3pt arc: center on basket, large radius so arc fills most of chart
const ARC_R = 340;   // arc bottom at BY+ARC_R = 370 ≈ 88% of CH=420

// Corner 3: vertical lines ~5% from each side edge
const CX_L = 22;
const CX_R = CW - CX_L;  // 398
// Arc meets corner line at:
const _cdx  = BX - CX_L;  // 188
const _cdy  = Math.sqrt(ARC_R * ARC_R - _cdx * _cdx);  // ≈286
const COR_Y = BY + _cdy;   // ≈316  (where arc meets corner vertical)

// Wing/top-arc split — midway between FT line and arc bottom
const WING_Y = BY + ARC_R * 0.73;  // ≈278
const _wdx   = Math.sqrt(ARC_R * ARC_R - Math.pow(WING_Y - BY, 2));  // ≈235

// D1 averages per zone (used for coloring vs average)
const D1_AVG = {
  restricted: 62, paint: 43, midrange: 37,
  corner3: 38, wing3: 35, top3: 35,
};

// ── COLORING ─────────────────────────────────────────────
// For individual courts: red = above avg (good offense / bad defense), blue = below avg
function zoneColor(zone, val, isDefense) {
  if (val == null) return 'rgba(18,26,46,0.7)';
  const diff = val - (D1_AVG[zone] || 38);
  const i = Math.min(Math.abs(diff) / 9, 1);
  if (diff > 0)
    return `rgba(${Math.round(215+40*i)},${Math.round(45*(1-i*.5))},${Math.round(35*(1-i*.6))},${.28+i*.62})`;
  else
    return `rgba(${Math.round(28*(1-i*.3))},${Math.round(100+40*(1-i))},${Math.round(215+40*i)},${.28+i*.62})`;
}

// For matchup court: color based on NET edge
// netEdge > 0 = offense advantage, < 0 = defense advantage
function matchupColor(netEdge) {
  const a = Math.min(Math.abs(netEdge) / 15, 1);
  if (netEdge > 0)
    // Red = offense wins this zone
    return `rgba(${Math.round(215+40*a)},${Math.round(45*(1-a*.5))},${Math.round(35*(1-a*.6))},${.30+a*.60})`;
  else
    // Blue = defense wins this zone
    return `rgba(${Math.round(28*(1-a*.3))},${Math.round(100+40*(1-a))},${Math.round(215+40*a)},${.30+a*.60})`;
}

// ── MAP raw shot zones to 6 simplified zones ─────────────
function mapZ(d) {
  if (!d) return {};
  const avg = (a, b) => a != null && b != null ? (a + b) / 2 : (a ?? b);
  return {
    restricted: d.paint_circle,
    paint:      avg(d.left_paint, d.right_paint),
    midrange:   avg(d.left_mid, d.right_mid),
    corner3:    avg(d.left_corner3, d.right_corner3),
    wing3:      avg(d.left_wing3, d.right_wing3),
    top3:       d.top_arc3,
  };
}

// ── ZONE PATHS ────────────────────────────────────────────
// Layout (y increases downward, basket at top):
//
//  y=0 ═══[c3L]═══[  lane top  ]═══[c3R]═══  ← baseline (top of SVG)
//          [c3L] [mid] [basket] [mid] [c3R]
//          [c3L] [mid] [paint ] [mid] [c3R]
//                [mid]  FT line  [mid]
//                [mid] FT circle [mid]
//  COR_Y   [c3L]─────────────────────[c3R]    ← corner3 line ends / arc starts
//               [wing3]       [wing3]
//  WING_Y       [wing3] [top3][wing3]          ← wing/top split
//                      [  top3  ]
//  BY+ARC_R ════════════════════════════════   ← arc bottom
//  y=CH ═══════════════════════════════════    ← mid-court

function buildPaths() {
  const paintTop = BY + RA_R + 2;

  // Paint floor: inside lane, below RA
  const paint = `M ${LANE_X1},${paintTop} L ${LANE_X2},${paintTop} L ${LANE_X2},${LANE_BOT} L ${LANE_X1},${LANE_BOT} Z`;

  // Mid-range upper: beside lane, from top to LANE_BOT
  const mLu = `M 0,0 L ${LANE_X1},0 L ${LANE_X1},${LANE_BOT} L 0,${LANE_BOT} Z`;
  const mRu = `M ${CW},0 L ${LANE_X2},0 L ${LANE_X2},${LANE_BOT} L ${CW},${LANE_BOT} Z`;

  // Mid-range lower: beside FT circle, from LANE_BOT to COR_Y
  const mLl = `M 0,${LANE_BOT} L ${BX-FT_R},${LANE_BOT} A ${FT_R},${FT_R} 0 0,0 ${CX_L},${COR_Y} L 0,${COR_Y} Z`;
  const mRl = `M ${CW},${LANE_BOT} L ${BX+FT_R},${LANE_BOT} A ${FT_R},${FT_R} 0 0,1 ${CX_R},${COR_Y} L ${CW},${COR_Y} Z`;

  // Corner 3: strips at sides from TOP (y=0) down to COR_Y
  const c3L = `M 0,0 L ${CX_L},0 L ${CX_L},${COR_Y} L 0,${COR_Y} Z`;
  const c3R = `M ${CW},0 L ${CX_R},0 L ${CX_R},${COR_Y} L ${CW},${COR_Y} Z`;

  // Wing 3: arc zone from COR_Y inward to WING_Y, down to CH
  // sweep=1 (CW): arc bows AWAY from basket (downward) — correct for outward-curving 3pt line
  const w3L = `M ${CX_L},${COR_Y} A ${ARC_R},${ARC_R} 0 0,0 ${BX-_wdx},${WING_Y} L ${BX},${CH} L ${CX_L},${CH} Z`;
  const w3R = `M ${CX_R},${COR_Y} A ${ARC_R},${ARC_R} 0 0,1 ${BX+_wdx},${WING_Y} L ${BX},${CH} L ${CX_R},${CH} Z`;

  // Top arc 3: between lane extensions and arc, from LANE_TOP down to WING_Y
  const top3 = [
    `M ${LANE_X1},0`,
    `L ${LANE_X2},0`,
    `L ${LANE_X2},${LANE_TOP}`,
    `L ${BX+_wdx},${WING_Y}`,
    `A ${ARC_R},${ARC_R} 0 0,1 ${BX-_wdx},${WING_Y}`,
    `L ${LANE_X1},${LANE_TOP}`,
    `Z`,
  ].join(' ');

  return { paint, mLu, mRu, mLl, mRl, c3L, c3R, w3L, w3R, top3, paintTop };
}

// ── COURT LINES ───────────────────────────────────────────
function courtLines() {
  const s  = 'rgba(210,230,255,0.80)';
  const sd = 'rgba(210,230,255,0.38)';
  const lw = 2.0;

  const lane   = `<rect x="${LANE_X1}" y="${LANE_TOP}" width="${LANE_W}" height="${LANE_H}" fill="none" stroke="${s}" stroke-width="${lw}"/>`;
  const ftSol  = `<path d="M ${BX-FT_R},${LANE_BOT} A ${FT_R},${FT_R} 0 0,1 ${BX+FT_R},${LANE_BOT}" fill="none" stroke="${s}" stroke-width="${lw}"/>`;
  const ftDash = `<path d="M ${BX-FT_R},${LANE_BOT} A ${FT_R},${FT_R} 0 0,0 ${BX+FT_R},${LANE_BOT}" fill="none" stroke="${sd}" stroke-width="1.2" stroke-dasharray="5,4"/>`;

  // 3pt arc: from left corner (CX_L, COR_Y) sweep CW to right corner (CX_R, COR_Y)
  const arc = `<path d="M ${CX_L},${COR_Y} A ${ARC_R},${ARC_R} 0 0,0 ${CX_R},${COR_Y}" fill="none" stroke="${s}" stroke-width="${lw}"/>`;

  // Corner 3 vertical lines: from y=0 to COR_Y
  const cvl = `<line x1="${CX_L}" y1="0" x2="${CX_L}" y2="${COR_Y}" stroke="${s}" stroke-width="${lw}"/>`;
  const cvr = `<line x1="${CX_R}" y1="0" x2="${CX_R}" y2="${COR_Y}" stroke="${s}" stroke-width="${lw}"/>`;

  // Horizontal line at COR_Y (where corner meets arc)
  const chl = `<line x1="0"    y1="${COR_Y}" x2="${CX_L}"  y2="${COR_Y}" stroke="${s}" stroke-width="${lw}"/>`;
  const chr = `<line x1="${CX_R}" y1="${COR_Y}" x2="${CW}" y2="${COR_Y}" stroke="${s}" stroke-width="${lw}"/>`;

  // Wing dividers from arc split to lane top corners
  const wl = `<line x1="${BX-_wdx}" y1="${WING_Y}" x2="${LANE_X1}" y2="${LANE_TOP}" stroke="${sd}" stroke-width="1.3"/>`;
  const wr = `<line x1="${BX+_wdx}" y1="${WING_Y}" x2="${LANE_X2}" y2="${LANE_TOP}" stroke="${sd}" stroke-width="1.3"/>`;

  // RA circle
  const ra = `<circle cx="${BX}" cy="${BY}" r="${RA_R}" fill="none" stroke="${sd}" stroke-width="1.6"/>`;

  // Basket rim + backboard line
  const bkt = `<circle cx="${BX}" cy="${BY}" r="11" fill="none" stroke="${s}" stroke-width="2.2"/>
    <circle cx="${BX}" cy="${BY}" r="3" fill="${s}"/>
    <line x1="${BX}" y1="${BY-11}" x2="${BX}" y2="${LANE_TOP}" stroke="${sd}" stroke-width="1.2"/>`;

  return [lane, ftSol, ftDash, arc, cvl, cvr, chl, chr, wl, wr, ra, bkt].join('\n');
}

// ── INDIVIDUAL COURT SVG ──────────────────────────────────
function buildCourtSVG(shotData, isDefense, teamName, teamColor) {
  const raw = shotData || {};
  if (!Object.keys(raw).length) {
    return `<svg viewBox="0 0 ${CW} ${CH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${CW}px">
      <rect width="${CW}" height="${CH}" fill="#0d1520" rx="10"/>
      <text x="${CW/2}" y="${CH/2}" text-anchor="middle" dominant-baseline="middle"
        font-family="Barlow Condensed,sans-serif" font-size="16" fill="#556882">No data</text></svg>`;
  }

  const z = mapZ(raw);
  const p = buildPaths();
  const gc = k => zoneColor(k, z[k], isDefense);
  const fmt = v => v != null ? v.toFixed(1) + '%' : '--';
  const T = (x, y, t, sz=12, fw='700') =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="${sz}" font-weight="${fw}" fill="#fff">${t}</text>`;

  // Corner 3 label: vertical text in the corner strips
  const c3MidY = COR_Y / 2;
  const labels = [
    T(BX,                       BY,          fmt(z.restricted), 14, '900'),
    T(BX,                       LANE_BOT-38, fmt(z.paint),      12),
    T(LANE_X1/2,                LANE_BOT-70, fmt(z.midrange),   11),
    T(LANE_X2+(CW-LANE_X2)/2,  LANE_BOT-70, fmt(z.midrange),   11),
    `<text x="${CX_L/2}" y="${c3MidY}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="11" font-weight="600" fill="#fff"
      transform="rotate(-90,${CX_L/2},${c3MidY})">${fmt(z.corner3)}</text>`,
    `<text x="${CX_R+(CW-CX_R)/2}" y="${c3MidY}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="11" font-weight="600" fill="#fff"
      transform="rotate(90,${CX_R+(CW-CX_R)/2},${c3MidY})">${fmt(z.corner3)}</text>`,
    T(CX_L + 65,  (COR_Y+CH)/2, fmt(z.wing3),  11, '600'),
    T(CX_R - 65,  (COR_Y+CH)/2, fmt(z.wing3),  11, '600'),
    T(BX,         (WING_Y+CH)/2,fmt(z.top3),   12),
  ].join('');

  const efg = raw.efg != null ? raw.efg.toFixed(1) : '--';
  return `<svg viewBox="0 0 ${CW} ${CH}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;max-width:${CW}px">
    <rect width="${CW}" height="${CH}" fill="#0d1520" rx="10"/>
    <rect x="${LANE_X1}" y="${LANE_TOP}" width="${LANE_W}" height="${LANE_H}" fill="rgba(40,60,95,0.15)"/>
    <path d="${p.c3L}"  fill="${gc('corner3')}"/>
    <path d="${p.c3R}"  fill="${gc('corner3')}"/>
    <path d="${p.w3L}"  fill="${gc('wing3')}"/>
    <path d="${p.w3R}"  fill="${gc('wing3')}"/>
    <path d="${p.top3}" fill="${gc('top3')}"/>
    <path d="${p.mLu}"  fill="${gc('midrange')}"/>
    <path d="${p.mRu}"  fill="${gc('midrange')}"/>
    <path d="${p.mLl}"  fill="${gc('midrange')}"/>
    <path d="${p.mRl}"  fill="${gc('midrange')}"/>
    <path d="${p.paint}" fill="${gc('paint')}"/>
    <circle cx="${BX}" cy="${BY}" r="${RA_R}" fill="${gc('restricted')}"/>
    ${courtLines()}
    ${labels}
    <rect x="0" y="${CH-26}" width="${CW}" height="26" fill="rgba(7,11,22,0.92)"/>
    <text x="${CW/2}" y="${CH-13}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="13" font-weight="800" fill="${teamColor}">
      ${isDefense ? 'Opp eFG% Allowed' : 'Off eFG%'}: ${efg}%</text>
  </svg>`;
}

// ── MATCHUP COURT (new logic) ─────────────────────────────
// Instead of offense% - defense%, compare each to D1 average:
//   offEdge = offVal - d1Avg  (how far above avg the offense shoots)
//   defEdge = d1Avg - defVal  (how far below avg the defense allows)
//   netEdge = defEdge - offEdge  (positive = defense wins zone, negative = offense wins)
function calcMatchupEdges(offData, defData) {
  const oz = mapZ(offData), dz = mapZ(defData);
  const zones = ['restricted','paint','midrange','corner3','wing3','top3'];
  const result = {};
  for (const k of zones) {
    const offVal = oz[k], defVal = dz[k], avg = D1_AVG[k];
    if (offVal == null || defVal == null) continue;
    const offEdge = offVal - avg;        // + = offense better than avg
    const defEdge = avg - defVal;        // + = defense better than avg (holds below avg)
    const netEdge = offEdge - defEdge;   // + = offense wins, - = defense wins
    result[k] = { offVal, defVal, avg, offEdge, defEdge, netEdge: parseFloat(netEdge.toFixed(1)) };
  }
  return result;
}

function buildMatchupCourtSVG(offData, defData, offName, defName) {
  if (!offData || !defData) return '<p style="color:#556882">No data available</p>';
  const edges = calcMatchupEdges(offData, defData);

  const p = buildPaths();
  const dc = k => edges[k] ? matchupColor(edges[k].netEdge) : 'rgba(18,26,46,0.7)';
  const dl = k => {
    if (!edges[k]) return '--';
    const e = edges[k];
    // Show the net result with a clear winner label
    const winner = e.netEdge < 0 ? 'DEF' : e.netEdge > 0 ? 'OFF' : '=';
    return (e.netEdge > 0 ? '+' : '') + e.netEdge.toFixed(1);
  };

  const T = (x, y, t, sz=12, fw='700') =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="${sz}" font-weight="${fw}" fill="#fff">${t}</text>`;

  const c3MidY = COR_Y / 2;
  const labels = [
    T(BX,                      BY,           dl('restricted'), 14,'900'),
    T(BX,                      LANE_BOT-38,  dl('paint'),      12),
    T(LANE_X1/2,               LANE_BOT-70,  dl('midrange'),   11),
    T(LANE_X2+(CW-LANE_X2)/2, LANE_BOT-70,  dl('midrange'),   11),
    `<text x="${CX_L/2}" y="${c3MidY}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="11" font-weight="600" fill="#fff"
      transform="rotate(-90,${CX_L/2},${c3MidY})">${dl('corner3')}</text>`,
    `<text x="${CX_R+(CW-CX_R)/2}" y="${c3MidY}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="11" font-weight="600" fill="#fff"
      transform="rotate(90,${CX_R+(CW-CX_R)/2},${c3MidY})">${dl('corner3')}</text>`,
    T(CX_L+65,   (COR_Y+CH)/2, dl('wing3'),  11,'600'),
    T(CX_R-65,   (COR_Y+CH)/2, dl('wing3'),  11,'600'),
    T(BX,        (WING_Y+CH)/2,dl('top3'),   12),
  ].join('');

  return `<svg viewBox="0 0 ${CW} ${CH}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;max-width:${CW}px">
    <rect width="${CW}" height="${CH}" fill="#0d1520" rx="10"/>
    <rect x="${LANE_X1}" y="${LANE_TOP}" width="${LANE_W}" height="${LANE_H}" fill="rgba(40,60,95,0.15)"/>
    <path d="${p.c3L}"  fill="${dc('corner3')}"/>
    <path d="${p.c3R}"  fill="${dc('corner3')}"/>
    <path d="${p.w3L}"  fill="${dc('wing3')}"/>
    <path d="${p.w3R}"  fill="${dc('wing3')}"/>
    <path d="${p.top3}" fill="${dc('top3')}"/>
    <path d="${p.mLu}"  fill="${dc('midrange')}"/>
    <path d="${p.mRu}"  fill="${dc('midrange')}"/>
    <path d="${p.mLl}"  fill="${dc('midrange')}"/>
    <path d="${p.mRl}"  fill="${dc('midrange')}"/>
    <path d="${p.paint}" fill="${dc('paint')}"/>
    <circle cx="${BX}" cy="${BY}" r="${RA_R}" fill="${dc('restricted')}"/>
    ${courtLines()}
    ${labels}
    <rect x="0" y="${CH-26}" width="${CW}" height="26" fill="rgba(7,11,22,0.92)"/>
    <text x="${CW*.3}" y="${CH-13}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="11" fill="rgba(96,165,250,0.88)">■ Blue = Defense edge</text>
    <text x="${CW*.7}" y="${CH-13}" text-anchor="middle" dominant-baseline="middle"
      font-family="Barlow Condensed,sans-serif" font-size="11" fill="rgba(248,113,113,0.88)">■ Red = Offense edge</text>
  </svg>`;
}

// ── ZONE TABLE (updated logic) ────────────────────────────
function getZoneMatchupData(offData, defData) {
  const edges = calcMatchupEdges(offData, defData);
  const names = { restricted:'Restricted Area', paint:'Paint Floor', midrange:'Mid-Range',
                  corner3:'Corner 3', wing3:'Wing 3', top3:'Top Arc 3' };
  return Object.entries(names)
    .filter(([k]) => edges[k])
    .map(([k, label]) => ({ key:k, label, ...edges[k] }))
    .sort((a, b) => Math.abs(b.netEdge) - Math.abs(a.netEdge));
}
