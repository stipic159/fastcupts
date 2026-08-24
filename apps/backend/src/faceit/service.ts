import { LRUCache } from 'lru-cache';
import pLimit from 'p-limit';
import type { FaceitPlayer, FaceitStatus } from '@fastcup/shared';
import type { Config } from '../config.js';

type FaceitApiPlayer = {
  player_id: string;
  nickname: string;
  games?: Record<string, { faceit_elo?: number; skill_level?: number }>;
};

export class FaceitService {
  private readonly cache = new LRUCache<string, FaceitPlayer>({ max: 10_000, ttl: 60 * 60 * 1000 });
  constructor(private readonly config: Config) {}

  readonly lookupConcurrent = pLimit(10);

  async lookup(steamId: string): Promise<FaceitPlayer> {
    const cached = this.cache.get(steamId);
    if (cached) return cached;
    const checkedAt = new Date().toISOString();
    if (!this.config.FACEIT_API_KEY) return { steamId, status: 'API_ERROR', checkedAt };
    const url = new URL('https://open.faceit.com/data/v4/players');
    url.searchParams.set('game', 'cs2');
    url.searchParams.set('game_player_id', steamId);
    const result = await this.request(url, checkedAt, steamId);
    this.cache.set(steamId, result);
    return result;
  }

  private async request(url: URL, checkedAt: string, steamId: string): Promise<FaceitPlayer> {
    for (const delay of [0, 500, 1500, 4000]) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.config.FACEIT_API_KEY}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(5_000),
        });
        if (response.status === 404) return { steamId, status: 'NOT_FOUND', checkedAt };
        if (response.status === 429) return { steamId, status: 'RATE_LIMITED', checkedAt };
        if (response.status >= 400 && response.status < 500) return { steamId, status: 'API_ERROR', checkedAt };
        if (!response.ok) continue;
        const player = (await response.json()) as FaceitApiPlayer;
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
        // Retry transient network failures and timeouts only.
      }
    }
    return { steamId, status: 'API_ERROR' as FaceitStatus, checkedAt };
  }
}
