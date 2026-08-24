import { fastcupGraphql } from './client.js';

const GET_TOURNAMENT = `
query GetTournament($tournamentId: Int!) {
  tournament: tournaments_by_pk(id: $tournamentId) {
    id
    name
    state
    slots
    prizeFund: prize_fund
    stages(order_by: { number: asc }) { id name state type }
  }
}`;

const GET_CURRENT_USER_TOURNAMENT_ROSTERS = `
query GetCurrentUserTournamentRosters($tournamentId: Int!, $currentUserId: Int!, $gameId: smallint!) {
  rosters: tournament_rosters(
    where: {tournament_id: {_eq: $tournamentId}, state: {_in: ["ACTIVE", "REJECTED", "PENDING", "BANNED"]}, _or: [{members: {user_id: {_eq: $currentUserId}}}, {team: {managers: {accepted_at: {_is_null: false}, finished_at: {_is_null: true}, user_id: {_eq: currentUserId}}}}]}
  ) {
    id
    state
    captainId: captain_id
    team {
      id
      tag
      name
      logo
      verified
      country { id iso2 nameEn: name_en nameRu: name_ru }
    }
    members {
      id
      role
      user {
        id
        link
        avatar
        online
        verified
        isMobile: is_mobile
        nickName: nick_name
        animatedAvatar: animated_avatar
        stats(where: {game_id: {_eq: $gameId}, map_id: {_is_null: true}, game_mode_id: {_is_null: false}}) {
          kills
          deaths
          place
          rating
          winRate: win_rate
          gameModeId: game_mode_id
        }
      }
    }
  }
}`;

type TournamentResponse = { tournament: { id: number; name: string; state: string; slots: number | null; prizeFund: number | null; stages: Array<{ id: number; name: string; state: string; type: string }> } | null };

type RostersResponse = { rosters: Array<{ id: number; state: string; team: { id: number; tag: string; name: string; logo: string | null } | null; members: Array<{ user: { id: number; nickName: string; avatar?: string | null } | null }> }> };

export async function getFastcupTournament(id: number) {
  const result = await fastcupGraphql<TournamentResponse>(GET_TOURNAMENT, { tournamentId: id }, 'GetTournament');
  return result.tournament;
}

export async function getFastcupTournamentRosters(id: number) {
  const result = await fastcupGraphql<RostersResponse>(GET_CURRENT_USER_TOURNAMENT_ROSTERS, {
    tournamentId: id,
    currentUserId: 3584698,
    gameId: 3,
  }, 'GetCurrentUserTournamentRosters');

  return result.rosters.map((roster) => ({
    id: roster.id,
    state: roster.state,
    team: roster.team,
    players: roster.members.map(({ user }) => user).filter(Boolean),
  }));
}
