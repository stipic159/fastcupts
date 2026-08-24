import { buildApp } from './app.js';
import { readConfig } from './config.js';

const config = readConfig();
const app = await buildApp(config);
await app.listen({ host: config.HOST, port: config.PORT });
