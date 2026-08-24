const FASTCUP_GRAPHQL_URL = 'https://hasura.fastcup.net/v1/graphql';

export async function fastcupGraphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(FASTCUP_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`FASTCUP GraphQL HTTP ${response.status}`);
  }

  const json = await response.json() as { data?: T; errors?: unknown };

  if (!json.data) {
    throw new Error('FASTCUP GraphQL returned no data');
  }

  return json.data;
}
