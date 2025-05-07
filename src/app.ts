import express from 'express';
import './db/database.js';

import { APIerrors } from './routers/errors.js';
import { APIgoods } from './routers/APIgoods.js';
import { APImerchant } from './routers/APImerchants.js';
import { APIhunter } from './routers/APIhunters.js';
import { APItransactions } from './routers/APItransactions.js';

export const app = express();
app.disable("x-powered-by"); // problema de seguridad de sonarqube

app.use(express.json());

app.use(APIgoods);
app.use(APImerchant);
app.use(APIhunter);
app.use(APItransactions);
app.use(APIerrors);