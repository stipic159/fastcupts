import { z } from 'zod';

const EnvSchema = z.object({
  FACEIT_API_KEY: z.string().min(1).optional(),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Config = z.infer<typeof EnvSchema>;
export const readConfig = (): Config => EnvSchema.parse(process.env);
