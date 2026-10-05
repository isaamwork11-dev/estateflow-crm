import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './db/mongodb.js';
import { logger } from './utils/logger.js';

async function main() {
  await connectMongo();
  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });
}

main().catch((err) => {
  logger.error('Fatal startup error', { error: String(err) });
  process.exit(1);
});
