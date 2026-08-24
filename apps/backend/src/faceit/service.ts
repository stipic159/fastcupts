import { LRUCache } from 'lru-cache';
import pLimit from 'p-limit';
import { z } from 'zod';
import type { FaceitPlayer } from '@fastcup/shared';
import type { Config } from '../config.js';

const FACEIT_ELO_TTL_MS = 15 * 60 * 1000;
const FACEIT_NOT_FOUND_TTL_MS = 6 * 60 * 60 * 1000;
const RETRY_DELAYS_MS = [0, 500, 1500, 4000] as const;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const FaceitCs2GameSchema = z
  .object({
    faceit_elo: z.number().int().nonnegative().optional(),
    skill_level: z.number().int().min(1).max(10).optional(),
  })
  .passthrough();

const FaceitApiPlayerSchema = z
  .object({
    player_id: z.string().min(1),
    nickname: z.string().min(1),
    games: z.record(z.string(), FaceitCs2GameSchema).optional(),
  })
  .passthrough();

export class FaceitService {
  private readonly cache = new LRUCache<string, FaceitPlayer>({ max: 10_000 });

  constructor(private readonly config: Config) {}

  readonly lookupConcurrent = pLimit(5);

  async lookup(steamId: string): Promise<FaceitPlayer> {
    const cached = this.cache.get(steamId);
    if (cached) return cached;

    const checkedAt = new Date().toISOString();
    if (!this.config.FACEIT_API_KEY) return { steamId, status: 'API_ERROR', checkedAt };

    const url = new URL('https://open.faceit.com/data/v4/players');
    url.searchParams.set('game', 'cs2');
    url.searchParams.set('game_player_id', steamId);

    const result = await this.request(url, checkedAt, steamId);

    if (result.status === 'OK') {
      this.cache.set(steamId, result, { ttl: FACEIT_ELO_TTL_MS });
    } else if (result.status === 'NOT_FOUND') {
      this.cache.set(steamId, result, { ttl: FACEIT_NOT_FOUND_TTL_MS });
    }

    return result;
  }

  private async request(url: URL, checkedAt: string, steamId: string): Promise<FaceitPlayer> {
    let lastFailure: 'API_ERROR' | 'RATE_LIMITED' = 'API_ERROR';

    for (const delay of RETRY_DELAYS_MS) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.config.FACEIT_API_KEY}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(5_000),
        });

        if (response.status === 404) return { steamId, status: 'NOT_FOUND', checkedAt };

        if (RETRYABLE_STATUSES.has(response.status)) {
          lastFailure = response.status === 429 ? 'RATE_LIMITED' : 'API_ERROR';
          continue;
        }

        if (response.status >= 400 && response.status < 500) {
          return { steamId, status: 'API_ERROR', checkedAt };
        }

        if (!response.ok) {
          return { steamId, status: 'API_ERROR', checkedAt };
        }

        const parsed = FaceitApiPlayerSchema.safeParse(await response.json());
        if (!parsed.success) return { steamId, status: 'API_ERROR', checkedAt };

        const player = parsed.data;
        const cs2 = player.games?.cs2;

        return {
          steamId,
          status: 'OK',
          playerId: player.player_id,
          nickname: player.nickname,
          ...(cs2?.faceit_elo === undefined ? {} : { elo: cs2.faceit_elo }),
          ...(cs2?.skill_level === undefined ? {} : { level: cs2.skill_level }),
          checkedAt,
        };
      } catch {
        lastFailure = 'API_ERROR';
      }
    }

    return { steamId, status: lastFailure, checkedAt };
  }
}
