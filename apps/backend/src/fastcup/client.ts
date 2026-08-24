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

  const json = await response.json() as { data?: T; errors?: Array<{ message?: string }> };

  if (json.errors?.length) {
    throw new Error(`FASTCUP GraphQL: ${json.errors.map((error) => error.message ?? 'unknown error').join(', ')}`);
  }

  if (!json.data) {
    throw new Error('FASTCUP GraphQL returned no data');
  }

  return json.data;
}
