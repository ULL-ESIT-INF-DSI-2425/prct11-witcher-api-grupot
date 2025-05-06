import express from 'express';
import './db/database.js';

import { APIerrors } from './routers/errors.js';
import { APIgoods } from './routers/APIgoods.js';
import { APImerchant } from './routers/APImerchants.js';
import { APIhunter } from './routers/APIhunters.js';
// import { APItransactions } from './routers/APItransactions.js';
import { APIuser } from './routers/APIusers.js';

export const app = express();
app.use(express.json());

app.use(APIuser);
app.use(APIgoods);
app.use(APImerchant);
app.use(APIhunter);
// app.use(APItransactions);
app.use(APIerrors);