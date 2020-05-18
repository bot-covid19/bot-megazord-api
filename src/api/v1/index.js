import { Router } from 'express';

import * as Bot from './controllers/Bot';

const v1Router = Router();

// v1Router.post('/trigger', Bot.triggerBulkFollowUp);
v1Router.post('/follow-up', Bot.createFollowUp);
v1Router.post('/wellness', Bot.wellnessUpdate);
v1Router.post('/symptoms', Bot.symptomsUpdate);

export default v1Router;