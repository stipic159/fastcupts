import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Config } from '../config.js';
import { FaceitService } from './service.js';

const STEAM_ID = '76561198000000000';
const config: Config = {
  FACEIT_API_KEY: 'test-key',
  HOST: '127.0.0.1',
  PORT: 3000,
  CORS_ORIGIN: 'chrome-extension://test',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function faceitPlayer(steamId = STEAM_ID) {
  return {
    player_id: 'faceit-player-id',
    nickname: 'player',
    games: {
      cs2: {
        faceit_elo: 2845,
        skill_level: 10,
      },
    },
    steam_id_64: steamId,
  };
}

describe('FaceitService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('parses a successful FACEIT response and caches it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(faceitPlayer()));
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    const first = await service.lookup(STEAM_ID);
    const second = await service.lookup(STEAM_ID);

    expect(first).toMatchObject({
      steamId: STEAM_ID,
      status: 'OK',
      playerId: 'faceit-player-id',
      nickname: 'player',
      elo: 2845,
      level: 10,
    });
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns NOT_FOUND for 404 and caches the result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    const first = await service.lookup(STEAM_ID);
    const second = await service.lookup(STEAM_ID);

    expect(first.status).toBe('NOT_FOUND');
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid FACEIT JSON and does not cache API errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ nickname: 'missing-player-id' }));
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    expect((await service.lookup(STEAM_ID)).status).toBe('API_ERROR');
    expect((await service.lookup(STEAM_ID)).status).toBe('API_ERROR');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries 429 with backoff and returns success when FACEIT recovers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(jsonResponse(faceitPlayer()));
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    const lookup = service.lookup(STEAM_ID);
    await vi.advanceTimersByTimeAsync(500);
    const result = await lookup;

    expect(result.status).toBe('OK');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([502, 503, 504])('retries transient HTTP %i responses and returns API_ERROR after exhaustion', async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }));
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    const lookup = service.lookup(STEAM_ID);
    await vi.runAllTimersAsync();
    const result = await lookup;

    expect(result.status).toBe('API_ERROR');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('retries network failures and returns API_ERROR after exhaustion', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network failed'));
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    const lookup = service.lookup(STEAM_ID);
    await vi.runAllTimersAsync();
    const result = await lookup;

    expect(result.status).toBe('API_ERROR');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('limits concurrent FACEIT lookups to five', async () => {
    let active = 0;
    let maxActive = 0;
    const releases: Array<() => void> = [];

    const fetchMock = vi.fn().mockImplementation(async (input: string | URL | Request) => {
      active += 1;
      maxActive = Math.max(maxActive, active);

      await new Promise<void>((resolve) => releases.push(resolve));
      active -= 1;

      const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
      const steamId = url.searchParams.get('game_player_id') ?? STEAM_ID;
      return jsonResponse(faceitPlayer(steamId));
    });
    vi.stubGlobal('fetch', fetchMock);
    const service = new FaceitService(config);

    const lookups = Array.from({ length: 6 }, (_, index) => {
      const steamId = `7656119800000000${index}`;
      return service.lookupConcurrent(() => service.lookup(steamId));
    });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
    expect(maxActive).toBe(5);

    releases.shift()?.();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(6));
    expect(maxActive).toBe(5);

    while (releases.length > 0) releases.shift()?.();
    await Promise.all(lookups);
  });
});
