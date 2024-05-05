import 'dotenv/config';
import { startNotificationsServer } from "./notifications";
import { startQueueProcessing } from './queue-websocket-server';
import { startWebhookServer } from './queue-webhook';

startNotificationsServer();
startQueueProcessing();
startWebhookServer();