import { Router } from 'express';

import * as Bot from './controllers/Bot';

const v1Router = Router();

v1Router.post('/incoming', Bot.incoming);
v1Router.post('/callback', Bot.callback);
v1Router.post('/send', Bot.send);

export default v1Router;