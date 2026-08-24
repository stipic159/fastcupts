export type FastcupPage = 'player' | 'match' | 'tournament' | 'unknown';

export function detectCurrentPage(pathname = location.pathname): FastcupPage {
  if (/tournament/i.test(pathname)) return 'tournament';
  if (/match|lobby/i.test(pathname)) return 'match';
  if (/player|profile/i.test(pathname)) return 'player';
  return 'unknown';
}
