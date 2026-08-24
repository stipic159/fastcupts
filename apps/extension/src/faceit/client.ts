import { FaceitBatchResponseSchema, type FaceitBatchResponse } from '@fastcup/shared';
import { config } from '../config';

export async function lookupFaceitPlayers(steamIds: string[]): Promise<FaceitBatchResponse> {
  if (!config.apiBaseUrl) throw new Error('WXT_SCOUT_API_BASE_URL is not configured');
  const response = await fetch(`${config.apiBaseUrl}/v1/faceit/players/batch`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ steamIds }),
  });
  if (!response.ok) throw new Error(`Scout backend returned ${response.status}`);
  return FaceitBatchResponseSchema.parse(await response.json());
}
