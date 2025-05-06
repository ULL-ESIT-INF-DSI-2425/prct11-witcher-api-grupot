import express from 'express';
import { createTransaction, deleteTransaction, getTransactions, getTransactionById, updateTransaction } from '../controllers/transactionsControler.js';

export const APItransactions = express.Router();

APItransactions.post('/transactions', async (req, res) => {
  await createTransaction(req, res);
});

APItransactions.get('/transactions', async (req, res) => {
  await getTransactions(req, res);
});

APItransactions.get('/transactions/:id', async (req, res) => {
  await getTransactionById(req, res);
});

APItransactions.patch('/transactions', async (req, res) => {
  await updateTransaction(req, res);
});

APItransactions.delete('/transactions/:id', async (req, res) => {
  await deleteTransaction(req, res);
});