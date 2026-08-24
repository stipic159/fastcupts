import { getFastcupTournamentRosters } from './service';

export async function scoutCurrentTournament(tournamentId: number) {
  const rosters = await getFastcupTournamentRosters(tournamentId);

  console.debug('[FASTCUP SCOUT] rosters', rosters);

  return rosters;
}
