const BACKEND_URL = 'http://127.0.0.1:3000';

export async function getFastcupTournamentRosters(tournamentId: number) {
  const response = await fetch(
    `${BACKEND_URL}/v1/fastcup/tournaments/${tournamentId}/teams`,
  );

  if (!response.ok) {
    throw new Error(`FASTCUP backend failed: ${response.status}`);
  }

  return response.json();
}
