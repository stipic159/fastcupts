import { z } from 'zod';

export const SteamIdSchema = z.string().regex(/^7656\d{13}$/, 'Expected a 17-digit SteamID64');
export const FaceitStatusSchema = z.enum(['OK', 'NOT_FOUND', 'NO_STEAM_ID', 'API_ERROR', 'RATE_LIMITED', 'INVALID_STEAM_ID']);
export type FaceitStatus = z.infer<typeof FaceitStatusSchema>;

export const FaceitPlayerSchema = z.object({
  steamId: SteamIdSchema,
  status: FaceitStatusSchema,
  playerId: z.string().optional(),
  nickname: z.string().optional(),
  elo: z.number().int().nonnegative().optional(),
  level: z.number().int().min(1).max(10).optional(),
  checkedAt: z.string().datetime(),
});
export type FaceitPlayer = z.infer<typeof FaceitPlayerSchema>;

export const FaceitBatchRequestSchema = z.object({
  steamIds: z.array(SteamIdSchema).min(1).max(500),
});
export const FaceitBatchResponseSchema = z.object({
  players: z.array(FaceitPlayerSchema),
});
export type FaceitBatchResponse = z.infer<typeof FaceitBatchResponseSchema>;

export const TournamentSchema = z.object({
  status: z.enum(['COMPLETE', 'PARTIAL', 'PARSE_FAILED']),
  parserVersion: z.number().int().positive(),
});
export type Tournament = z.infer<typeof TournamentSchema>;
