const FASTCUP_GRAPHQL_URL = 'https://hasura.fastcup.net/v1/graphql';

export async function fastcupGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string,
): Promise<T> {
  const response = await fetch(FASTCUP_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'apollographql-client-name': 'web-prod-embed',
      'apollographql-client-version': '792feec86d19c5aa6d0376f55ac8e664197a444c',
      'x-instance-id': 'gmjijd',
    },
    body: JSON.stringify({ query, variables, operationName }),
  });

  if (!response.ok) {
    throw new Error(`FASTCUP GraphQL HTTP ${response.status}`);
  }

  const json = await response.json() as { data?: T; errors?: Array<{ message?: string }> };

  if (json.errors?.length) {
    console.error('FASTCUP GRAPHQL ERRORS', JSON.stringify(json.errors, null, 2));
    console.error('FASTCUP GRAPHQL REQUEST', JSON.stringify({ operationName, variables }, null, 2));
    throw new Error(`FASTCUP GraphQL: ${json.errors.map((error) => error.message ?? 'unknown error').join(', ')}`);
  }

  if (!json.data) {
    throw new Error('FASTCUP GraphQL returned no data');
  }

  return json.data;
}
