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

const GET_TOURNAMENT_ROSTERS = `
query GetTournamentRosters($tournamentId: Int!, $createdAtGt: timestamptz, $states: [tournament_roster_state!]!, $limit: Int!, $teamName: String) {
  rosters: tournament_rosters(
    where: {tournament_id: {_eq: $tournamentId}, created_at: {_gt: $createdAtGt}, state: {_in: $states}, team: {name: {_ilike: $teamName}}}
    order_by: {created_at: asc}
    limit: $limit
  ) {
    id
    state
    captainId: captain_id
    createdAt: created_at
    team {
      ...TeamPrimaryParts
      country {
        ...CountryPrimaryParts
        ...CountryNameParts
        __typename
      }
      __typename
    }
    members {
      id
      role
      user {
        ...UserPrimaryParts
        country {
          ...CountryPrimaryParts
          ...CountryNameParts
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}

fragment TeamPrimaryParts on teams {
  id
  tag
  name
  logo
  verified
  __typename
}

fragment CountryPrimaryParts on countries {
  id
  iso2
  __typename
}

fragment CountryNameParts on countries {
  nameEn: name_en
  nameRu: name_ru
  nameDe: name_de
  namePl: name_pl
  namePt: name_pt
  nameHbs: name_hbs
  nameUk: name_uk
  nameFr: name_fr
  nameEs: name_es
  nameTr: name_tr
  __typename
}

fragment UserPrimaryParts on users {
  id
  link
  avatar
  online
  verified
  isMobile: is_mobile
  nickName: nick_name
  animatedAvatar: animated_avatar
  __typename
}`;

type TournamentResponse = {
  tournament: {
    id: number;
    name: string;
    state: string;
    slots: number | null;
    prizeFund: number | null;
    stages: Array<{ id: number; name: string; state: string; type: string }>;
  } | null;
};

type RostersResponse = {
  rosters: Array<{
    id: number;
    state: string;
    team: { id: number; tag: string; name: string; logo: string | null } | null;
    members: Array<{ user: { id: number; nickName: string } | null }>;
  }>;
};

export async function getFastcupTournament(id: number) {
  const result = await fastcupGraphql<TournamentResponse>(GET_TOURNAMENT, { tournamentId: id }, 'GetTournament');
  return result.tournament;
}

export async function getFastcupTournamentRosters(id: number) {
  const result = await fastcupGraphql<RostersResponse>(GET_TOURNAMENT_ROSTERS, {
    tournamentId: id,
    createdAtGt: null,
    states: ['ACTIVE'],
    limit: 21,
    teamName: null,
  }, 'GetTournamentRosters');

  return result.rosters.map((roster) => ({
    id: roster.id,
    state: roster.state,
    team: roster.team,
    players: roster.members.map(({ user }) => user).filter(Boolean),
  }));
}
