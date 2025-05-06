import express from 'express';
import { Transaction } from '../models/transactions.js';
import { Good } from '../models/goods.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchant.js';

export const APItransaction = express.Router();

APItransactions.post("/transactions", async (req: Request, res: Response) => {
  try {
    const { transactionType, personName, items } = req.body;

    const personModel = transactionType === "purchase" ? Merchant : Hunter;
    const personType = transactionType === "purchase" ? "Merchant" : "Hunter";

    const person = await personModel.findOne({ name: personName });
    if (!person) return res.status(404).send({ error: `${personType} not found` });

    const populatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const good = await Good.findOne({ name: item.name });
      if (!good) return res.status(404).send({ error: `Good "${item.name}" not found` });

      const unitPrice = good.value;
      const quantity = item.quantity;

      if (transactionType === "sale") {
        if (good.stock < quantity) {
          return res.status(400).send({ error: `Insufficient stock for "${good.name}"` });
        }
        good.stock -= quantity;
      } else {
        good.stock += quantity;
      }

      await good.save();

      populatedItems.push({
        goodId: good._id,
        goodName: good.name,
        quantity,
        unitPrice,
      });

      totalAmount += unitPrice * quantity;
    }

    const transaction = new Transaction({
      transactionType,
      personType,
      personId: person._id,
      personName,
      items: populatedItems,
      totalAmount,
    });

    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
});