import { fastcupGraphql } from './client';

const GET_TOURNAMENT_ROSTERS = `
query GetTournamentRosters($tournamentId: Int!) {
  rosters: tournament_rosters(
    where: { tournament_id: { _eq: $tournamentId }, state: { _eq: "ACTIVE" } }
  ) {
    id
    state
    team {
      id
      tag
      name
      logo
    }
    members {
      id
      role
      user {
        id
        nickName: nick_name
        avatar
      }
    }
  }
}`;

type RostersResponse = {
  rosters: unknown[];
};

export function getTournamentRosters(tournamentId: number) {
  return fastcupGraphql<RostersResponse>(
    GET_TOURNAMENT_ROSTERS,
    { tournamentId },
    'GetTournamentRosters',
  );
}
