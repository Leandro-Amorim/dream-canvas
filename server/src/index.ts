import 'dotenv/config';
import { startWebhookServer } from './queue-webhook';
import { processCron } from './cron-manager';
import { startWebsocketsServer } from './websockets-server';

startWebsocketsServer();
startWebhookServer();
processCron();