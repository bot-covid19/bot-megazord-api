import { Router } from 'express';

import * as Bot from './controllers/Bot';

const v1Router = Router();

// TODO: Doc these endpoints
v1Router.post('/incoming', Bot.incoming);
v1Router.post('/follow-up', Bot.createFollowUp);

export default v1Router;