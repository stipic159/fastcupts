import { fastcupGraphql } from './client.js';

const GET_TOURNAMENT = `
query GetTournament($tournamentId: Int!) {
  tournament: tournaments_by_pk(id: $tournamentId) {
    id
    name
    state
    slots
    prizeFund: prize_fund
    stages(order_by: { number: asc }) {
      id
      name
      state
      type
    }
  }
}`;

type TournamentResponse = {
  tournament: {
    id: number;
    name: string;
    state: string;
    slots: number | null;
    prizeFund: number | null;
    stages: Array<{
      id: number;
      name: string;
      state: string;
      type: string;
    }>;
  } | null;
};

export async function getFastcupTournament(id: number) {
  const result = await fastcupGraphql<TournamentResponse>(GET_TOURNAMENT, {
    tournamentId: id,
  });

  return result.tournament;
}
