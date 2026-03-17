// trends.js — Tournament Trends view

const TREND_META = {
  national_champion: {
    icon: '🏆',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.3)',
    historicalNote: 'Since 2010: Every national champion was top-15 in both offensive and defensive efficiency. 13 of 15 champions were 1 or 2 seeds.',
  },
  final_four: {
    icon: '🎯',
    color: '#60a5fa',
    bgColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.3)',
    historicalNote: 'Since 2015: 95% of Final Four teams were top-25 in AdjEM. Only one team seeded 6+ has reached the Final Four since 2014.',
  },
  sweet_16: {
    icon: '⭐',
    color: '#a78bfa',
    bgColor: 'rgba(167,139,250,0.1)',
    borderColor: 'rgba(167,139,250,0.3)',
    historicalNote: 'Since 2015: Teams ranked top-40 in AdjEM reach Sweet 16 at a 62% rate. Seeds 1-4 advance at 78%. 5-6 seeds advance at 54%.',
  },
  early_exit: {
    icon: '⚠️',
    color: '#f87171',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
    historicalNote: 'Red flags: Teams outside top-50 AdjEM lose in R1/R2 at 71% rate. Teams with eFG% < 50% cover just 37% of first-round games.',
  },
  upset_candidate: {
    icon: '💥',
    color: '#fb923c',
    bgColor: 'rgba(249,115,22,0.1)',
    borderColor: 'rgba(249,115,22,0.3)',
    historicalNote: 'Since 2016: Lower seeds ranked top-80 in AdjEM have pulled upsets in 43% of their games. 12-seeds with strong defenses win ~35% of R1.',
  },
  value_bets_ats: {
    icon: '💰',
    color: '#4ade80',
    bgColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.3)',
    historicalNote: 'ATS trends: Teams covering 55%+ during the season continue to cover in the tournament at a 58% rate. 1-seeds cover only 48% of tournament games.',
  },
  pace_disruptors: {
    icon: '⚡',
    color: '#e879f9',
    bgColor: 'rgba(232,121,249,0.1)',
    borderColor: 'rgba(232,121,249,0.3)',
    historicalNote: 'Pace chaos: Teams ranked 300+ in tempo cause upsets at 1.8x the average rate when matched vs top-50 pace teams. Slow teams beat higher seeds 31% of the time.',
  },
};

// Additional curated historical trends with team lists
const ADDITIONAL_TRENDS = [
  {
    key: 'power_conf_domination',
    icon: '🏛️',
    label: 'Power Conference Advantage',
    color: '#34d399',
    bgColor: 'rgba(52,211,153,0.1)',
    borderColor: 'rgba(52,211,153,0.3)',
    historicalNote: '14 of the last 15 national champions came from the ACC, Big Ten, Big 12, or SEC. Non-power conference teams have reached the Final Four only 4 times since 2010.',
    getTeams: (teams) => {
      // 2025-26 Power Conference members in the tournament field
      const POWER_CONF = new Set([
        // ACC
        'Duke','Louisville','Clemson','North Carolina','Miami FL','NC State','Virginia',
        // Big Ten
        'Michigan','Michigan State','Ohio State','Illinois','Purdue','Nebraska','Iowa','Wisconsin','UCLA',
        // Big 12
        'Iowa State','Houston','Kansas','BYU','Texas Tech','TCU','UCF','Texas','Arkansas',
        // SEC
        'Florida','Alabama','Tennessee','Kentucky','Vanderbilt','Georgia','Texas A&M','Missouri',
        // Big East
        "St. John's",'UConn','Villanova'
      ]);
      return Object.values(teams)
        .filter(t => POWER_CONF.has(t.name))
        .sort((a,b) => (a.em_rank||999) - (b.em_rank||999))
        .map(t => ({...t, score: 1.0, matched: ['Power Conference Team']}));
    }
  },
  {
    key: 'conference_tourney_momentum',
    icon: '🔥',
    label: 'Conference Tournament Momentum',
    color: '#fb923c',
    bgColor: 'rgba(251,146,60,0.1)',
    borderColor: 'rgba(251,146,60,0.3)',
    historicalNote: 'Teams that won their conference tournament have reached the Sweet 16 at 64% clip since 2015. Teams exiting in the first round of their conference tournament make the Sweet 16 only 28% of the time.',
    getTeams: (teams) => Object.values(teams)
      .filter(t => t.conf_tourney_result === 'won' && t.seed <= 12)
      .sort((a,b) => (a.em_rank||999) - (b.em_rank||999))
      .map(t => ({...t, score: 0.9, matched: ['Conference Tournament Champion', `Seed: ${t.seed}`]}))
  },
  {
    key: 'two_way_dominance',
    icon: '⚔️',
    label: 'Two-Way Dominance (Top 20 Both Ends)',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.3)',
    historicalNote: 'Since 2010, every national champion was top-20 in both offensive AND defensive efficiency. Teams achieving this profile win their first game 96% of the time.',
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.adj_oe_rank||999) <= 20 && (t.adj_de_rank||999) <= 20)
      .sort((a,b) => (a.adj_em_rank||999) - (b.adj_em_rank||999))
      .map(t => ({...t, score: 1.0, matched: [`Off #${t.adj_oe_rank}`, `Def #${t.adj_de_rank}`]}))
  },
  {
    key: 'shooting_efficiency',
    icon: '🎯',
    label: 'Elite Shooting Teams (eFG% > 55%)',
    color: '#60a5fa',
    bgColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.3)',
    historicalNote: 'Teams shooting above 55% eFG have won 68% of tournament games since 2015. The last 8 national champions all shot above 53% eFG in their title run.',
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.off_efg||0) >= 55.0)
      .sort((a,b) => (b.off_efg||0) - (a.off_efg||0))
      .map(t => ({...t, score: 0.9, matched: [`eFG ${t.off_efg?.toFixed(1)}%`]}))
  },
  {
    key: 'lockdown_defense',
    icon: '🔒',
    label: 'Lockdown Defense (Def eFG% < 46%)',
    color: '#a78bfa',
    bgColor: 'rgba(167,139,250,0.1)',
    borderColor: 'rgba(167,139,250,0.3)',
    historicalNote: 'Elite defensive teams (bottom-15 nationally in opponent eFG%) advance to the Elite Eight at double the rate of average defenses. Virginia won the title in 2019 allowing just 44.7% opponent eFG%.',
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.def_efg||99) < 46.0)
      .sort((a,b) => (a.def_efg||99) - (b.def_efg||99))
      .map(t => ({...t, score: 0.9, matched: [`Def eFG ${t.def_efg?.toFixed(1)}%`]}))
  },
  {
    key: 'slow_crawl_danger',
    icon: '🐢',
    label: 'Slow-Pace Danger Teams',
    color: '#e879f9',
    bgColor: 'rgba(232,121,249,0.1)',
    borderColor: 'rgba(232,121,249,0.3)',
    historicalNote: 'Bottom-50 pace teams (300+ KenPom tempo rank) beat higher-seeded opponents at 29% vs 22% average. Houston won 33 games in 2024 playing in the bottom-5 nationally in pace.',
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.kp_adj_tempo_rank||0) >= 280)
      .sort((a,b) => (a.em_rank||999) - (b.em_rank||999))
      .map(t => ({...t, score: 0.8, matched: [`Tempo rank #${t.kp_adj_tempo_rank}`, `${t.kp_adj_tempo?.toFixed(1)} poss/g`]}))
  },
  {
    key: 'first_time_tournament',
    icon: '🌟',
    label: 'Cinderella Candidates (12-15 seeds)',
    color: '#f87171',
    bgColor: 'rgba(248,113,113,0.1)',
    borderColor: 'rgba(248,113,113,0.3)',
    historicalNote: '12-seeds beat 5-seeds 35% of the time historically. 15-seeds have won 9 games all-time. Teams seeded 12-15 with top-80 AdjEM win their first game at 2x the rate of others at that seed.',
    getTeams: (teams) => Object.values(teams)
      .filter(t => t.seed >= 12 && (t.adj_em_rank||999) <= 100)
      .sort((a,b) => (a.adj_em_rank||999) - (b.adj_em_rank||999))
      .map(t => ({...t, score: 0.75, matched: [`Seed: ${t.seed}`, `AdjEM #${t.adj_em_rank}`]}))
  },
  {
    key: 'at_large_losing_conf',
    icon: '⚠️',
    label: 'At-Large Teams With Losing Conference Record',
    color: '#f87171',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
    historicalNote: "In the past 3 years, 10 at-large teams with sub-.500 conference records entered the tournament. Eight of those 10 failed to win a single game. Only Arkansas beat the odds — reaching the Sweet 16 both as an 8-seed (2023) and a 10-seed (2025). This year SMU (8-10 in the ACC) is the only at-large team with a losing conference record.",
    getTeams: (teams) => Object.values(teams)
      .filter(t => t.conf_w != null && t.conf_l != null && t.conf_l > t.conf_w)
      .sort((a,b) => (a.em_rank||999) - (b.em_rank||999))
      .map(t => ({...t, score: 0.2, matched: ['Conf record: ' + t.conf_w + '-' + t.conf_l]}))
  },
  {
    key: 'top10_off_weak_def',
    icon: '🚫',
    label: 'Top-10 Offense, Outside Top-90 Defense',
    color: '#fb923c',
    bgColor: 'rgba(249,115,22,0.1)',
    borderColor: 'rgba(249,115,22,0.3)',
    historicalNote: "Since 2011, only 2 of 47 teams with top-10 adjusted offensive efficiency but outside the top 90 defensively made the Sweet 16. Defense is non-negotiable in March — teams that win championships are almost always top-25 on both ends. This year only Texas (OE #13, DE #111) fits this danger profile.",
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.adj_oe_rank||999) <= 10 && (t.adj_de_rank||999) > 90)
      .sort((a,b) => (a.adj_oe_rank||999) - (b.adj_oe_rank||999))
      .map(t => ({...t, score: 0.25, matched: ['Off #' + t.adj_oe_rank, 'Def #' + t.adj_de_rank + ' (danger zone)']}))
  },
  {
    key: 'ap_poll_7weeks',
    icon: '📊',
    label: '93% of Champions Were AP Top-12 (7 Weeks Out)',
    color: '#fbbf24',
    bgColor: 'rgba(251,191,36,0.1)',
    borderColor: 'rgba(251,191,36,0.3)',
    historicalNote: "Since 1985, 93% of national champions appeared in the AP Top 12 approximately 7 weeks before the tournament. Only 3 champions in 40 years were ranked outside the top 12 at that point. This year's top-12 at 7 weeks out (~Jan 27): Duke, Arizona, Michigan, Florida, Nebraska, Houston, Iowa State, UConn, Michigan State, Purdue, Illinois, and BYU. Teams outside this group face a historically steep uphill climb.",
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.ap_7weeks||0) >= 1 && (t.ap_7weeks||0) <= 12)
      .sort((a,b) => (a.ap_7weeks||99) - (b.ap_7weeks||99))
      .map(t => ({...t, score: 0.85, matched: ['AP #' + t.ap_7weeks + ' at 7 weeks out']}))
  },,
  {
    key: 'home_proximity',
    icon: '🏠',
    label: '150-Mile Rule: Near-Home Teams Win 34% More',
    color: '#4ade80',
    bgColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.3)',
    historicalNote: "Peer-reviewed research (Clay, Bro & Clay, 2014 — 3,296 game performances) shows that playing within 150 miles of campus reduces the odds of losing by 33.6%, a statistically significant effect at the 0.01 level. The mechanism is binary, not a sliding scale: once inside the 150-mile radius, crowd composition shifts from 50/50 to roughly 70/30 in favor of the local team, creating a near home-court atmosphere. The 2026 teams below are all playing within 150 miles of their campus in the first and second rounds.",
    getTeams: (teams) => Object.values(teams)
      .filter(t => t.within_150mi === true)
      .sort((a,b) => (a.travel_miles||999) - (b.travel_miles||999))
      .map(t => ({...t, score: 0.9, matched: [t.travel_miles + ' miles to ' + (t.venue_city||'venue'), '~70/30 crowd split expected']}))
  },
  {
    key: 'eastward_curse',
    icon: '✈️',
    label: 'The Eastward Curse: 2+ Time Zones East → Win Rate Drops Below 38%',
    color: '#f43f5e',
    bgColor: 'rgba(244,63,94,0.1)',
    borderColor: 'rgba(244,63,94,0.3)',
    historicalNote: "The same peer-reviewed study found that traveling east across time zones significantly reduces win odds (odds ratio 0.861 = 13.9% drop per crossing). For teams crossing 2+ time zones eastward, win rates plummet below 38%. The biorhythmic sweet spot for peak athletic performance is 4–8 PM local time. A noon tip-off in Philadelphia feels like 9 AM to a team from Los Angeles — the equivalent of playing in morning grogginess. Note: westward travel does NOT carry the same penalty, as afternoon NCAA games align better with the body clocks of eastward-bound teams.",
    getTeams: (teams) => Object.values(teams)
      .filter(t => (t.tz_zones_east||0) >= 2)
      .sort((a,b) => (b.tz_zones_east||0) - (a.tz_zones_east||0))
      .map(t => ({...t, score: 0.3, matched: [(t.campus_tz||'?') + ' → ' + (t.venue_tz||'?') + ' (+' + t.tz_zones_east + ' time zones east)', t.travel_miles + ' miles to ' + (t.venue_city||'venue')]}))
  }
];

function renderTrends() {
  const el = document.getElementById('trends-content');
  const teams = TEAMS_DATA;

  let html = '';

  // First: computed trends from TRENDS_DATA
  const trendKeys = Object.keys(TRENDS_DATA.results);
  for (const key of trendKeys) {
    const meta = TREND_META[key];
    if (!meta) continue;
    const trend = TRENDS_DATA.trends[key];
    const results = TRENDS_DATA.results[key];

    html += renderTrendCard(
      meta.icon, trend.label, meta.color, meta.bgColor, meta.borderColor,
      meta.historicalNote, results.slice(0, 16)
    );
  }

  // Additional curated trends
  for (const trend of ADDITIONAL_TRENDS) {
    const results = trend.getTeams(teams).slice(0, 16);
    html += renderTrendCard(
      trend.icon, trend.label, trend.color, trend.bgColor, trend.borderColor,
      trend.historicalNote, results
    );
  }

  el.innerHTML = html;

  // Click handlers — clicking a team loads it into matchup
  el.querySelectorAll('[data-trend-team]').forEach(btn => {
    btn.addEventListener('click', () => {
      loadTeamIntoMatchup(btn.getAttribute('data-trend-team'));
    });
  });
}

function renderTrendCard(icon, label, color, bgColor, borderColor, historicalNote, teams) {
  const teamPills = teams.map(t => {
    const seedClass = `seed-bg-${Math.min(t.seed||16,16)}`;
    const matchStr = t.matched?.slice(0,2).join(' · ') || '';
    return `<div class="trend-team-pill" data-trend-team="${(t.name||'').replace(/"/g,'&quot;')}">
      <span class="trend-seed ${seedClass}">${t.seed}</span>
      <span class="trend-team-name">${t.name}</span>
      <span class="trend-match-note">${matchStr}</span>
    </div>`;
  }).join('');

  return `
    <div class="trend-card" style="border-color:${borderColor};background:linear-gradient(135deg,${bgColor},var(--bg2))">
      <div class="trend-card-header">
        <span class="trend-icon">${icon}</span>
        <div>
          <div class="trend-label" style="color:${color}">${label}</div>
          <div class="trend-note">${historicalNote}</div>
        </div>
        <div class="trend-count" style="color:${color}">${teams.length} teams</div>
      </div>
      <div class="trend-teams-grid">${teamPills || '<span style="color:#556882;font-size:12px">No teams match this profile</span>'}</div>
    </div>`;
}
