/** All FASTCUP DOM selectors belong here, so markup changes have one repair point. */
export const selectors = {
  player: { nickname: '[data-player-nickname]', steam: '[data-steam-id]' },
  team: { name: '[data-team-name]', roster: '[data-team-roster]' },
  tournament: { team: '[data-tournament-team]', bracket: '[data-bracket]' },
  bracket: { match: '[data-bracket-match]' },
} as const;
