export async function fastcupGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  operationName: string,
): Promise<T> {
  const response = await fetch('https://hasura.fastcup.net/v1/graphql', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
  });

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(`FASTCUP GraphQL: ${json.errors[0].message}`);
  }

  return json.data as T;
}
