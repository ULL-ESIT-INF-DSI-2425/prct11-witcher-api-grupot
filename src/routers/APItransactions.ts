import express from 'express';
import { createTransaction, deleteTransaction } from '../controllers/transactionsControler.js';

export const APItransactions = express.Router();

APItransactions.delete('/transactions/:id', async (req, res) => {
  await deleteTransaction(req, res);
});

APItransactions.post('/transactions', async (req, res) => {
  await createTransaction(req, res);
});