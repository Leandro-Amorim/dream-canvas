import 'dotenv/config';
import { processCron } from './cron-manager';
import { startWebsocketsServer } from './websockets-server';

startWebsocketsServer();
processCron();