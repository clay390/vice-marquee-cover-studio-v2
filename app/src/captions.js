// The six caption presets: invented titles, taglines and press quotes —
// nothing copied from the first entry or from the leaderboard's top entry.
// Each preset fills the chrome title, the neon script, the tagline ribbon,
// the masthead quote and its source, and the volume tab.

export const PRESETS = [
  {
    id: 'vice-marquee',
    name: 'Vice Marquee',
    title: 'VICE MARQUEE',
    script: 'one last summer',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    quote: 'PURE GOLDEN-HOUR MAYHEM',
    source: 'THE HARBOR GAZETTE',
    volume: 'VOL. 1',
  },
  {
    id: 'last-exit',
    name: 'Last Exit',
    title: 'LAST EXIT',
    script: 'no way back now',
    tagline: 'ONE ROAD · ONE NIGHT · NO BRAKES',
    quote: 'A THRILL RIDE FROM START TO FINISH',
    source: 'THE COASTAL REVIEW',
    volume: 'VOL. 2',
  },
  {
    id: 'copper-coast',
    name: 'Copper Coast',
    title: 'COPPER COAST',
    script: 'salt in the air',
    tagline: 'SUN, SALT AND STOLEN SUNSETS',
    quote: 'GLOWS LIKE A NEON SIGN AT DUSK',
    source: 'VICE WEEKLY',
    volume: 'VOL. 1',
  },
  {
    id: 'midnight-marina',
    name: 'Midnight Marina',
    title: 'MIDNIGHT MARINA',
    script: 'the tide never sleeps',
    tagline: 'BOATS, LIGHTS AND BAD DECISIONS',
    quote: 'AFTER DARK, THE CITY BELONGS TO YOU',
    source: 'THE MARINA POST',
    volume: 'SEASON ONE',
  },
  {
    id: 'golden-getaway',
    name: 'Golden Getaway',
    title: 'GOLDEN GETAWAY',
    script: 'chase the light',
    tagline: 'GOLD HOUR · FAST CARS · FASTER FRIENDS',
    quote: 'SUNSHINE WITH A SIDE OF TROUBLE',
    source: 'THE SUNSET TIMES',
    volume: 'PART II',
  },
  {
    id: 'neon-palms',
    name: 'Neon Palms',
    title: 'NEON PALMS',
    script: 'stay out past midnight',
    tagline: 'PALMS UP · LIGHTS ON · WORRY LATER',
    quote: 'ELECTRIC FROM THE FIRST FRAME',
    source: 'THE NEON HERALD',
    volume: 'VOL. 3',
  },
];

/** Returns a preset by id, falling back to the first one. */
export function getPreset(id) {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

/** Picks a random preset that is not the one with `exceptId`. */
export function randomPreset(exceptId) {
  const pool = PRESETS.filter((p) => p.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)];
}
