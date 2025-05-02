import express from 'express';

export const APIerrors = express.Router();

APIerrors.all('/{*splat}', (_, res) => {
  res.status(501).send();
});