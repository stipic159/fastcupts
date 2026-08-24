import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { FaceitBatchRequestSchema } from '@fastcup/shared';
import type { Config } from './config.js';
import { FaceitService } from './faceit/service.js';
import { getFastcupTournament, getFastcupTournamentRosters } from './fastcup/service.js';

export async function buildApp(config: Config) {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: config.CORS_ORIGIN });
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  const faceit = new FaceitService(config);

  app.get('/health', async () => ({ status: 'ok', faceitConfigured: Boolean(config.FACEIT_API_KEY) }));

  app.get('/v1/fastcup/tournaments/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    if (!Number.isInteger(id)) {
      return reply.code(400).send({ error: 'Invalid tournament id' });
    }

    const tournament = await getFastcupTournament(id);
    if (!tournament) {
      return reply.code(404).send({ error: 'Tournament not found' });
    }

    return { tournament };
  });

  app.get('/v1/fastcup/scout', async (request, reply) => {
    const id = Number((request.query as { id?: string }).id);
    if (!Number.isInteger(id)) {
      return reply.code(400).send({ error: 'Invalid tournament id' });
    }

    return { rosters: await getFastcupTournamentRosters(id) };
  });

  app.post('/v1/faceit/players/batch', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = FaceitBatchRequestSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid SteamID64 batch', details: parsed.error.flatten() });
    const steamIds = [...new Set(parsed.data.steamIds)];
    const players = await Promise.all(steamIds.map((steamId) => faceit.lookupConcurrent(() => faceit.lookup(steamId))));
    return { players };
  });
  return app;
}
