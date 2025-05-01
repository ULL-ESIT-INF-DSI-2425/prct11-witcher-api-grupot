import express, { Request, Response, Express } from "express";
import mongoose from 'mongoose';
import { TransactionManager } from './transactionsManager.js';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const manager = new TransactionManager();

app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://alu0101545455:@clusterprincipal.mkyvmkc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPrincipal';

// Conectarse a MongoDB ATLAS
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error', err));

// Crear una transacción de venta a un cazador
app.post('/transactions/sale', async (req: Request, res: Response) => {
  try {
    const { hunterName, items } = req.body;
    
    if (!hunterName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).send('Hunter name and items array are required');
      return;
    }
    
    const transaction = await manager.createSaleTransaction(hunterName, items);
    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Crear una transacción de compra a un mercader
app.post('/transactions/purchase', async (req: Request, res: Response) => {
  try {
    const { merchantName, items } = req.body;
    
    if (!merchantName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).send('Merchant name and items array are required');
      return;
    }
    
    const transaction = await manager.createPurchaseTransaction(merchantName, items);
    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer transacción por ID
app.get('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await manager.findTransactionById(req.params.id);
    if (!transaction) {
      res.status(404).send('Transaction not found');
      return;
    }
    res.json(transaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer transacciones por persona (cazador o mercader)
app.get('/transactions/person/:name', async (req: Request, res: Response) => {
  try {
    const transactions = await manager.findTransactionsByPersonName(req.params.name);
    if (transactions.length === 0) {
      res.status(404).send('No transactions found for this person');
      return;
    }
    res.json(transactions);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer transacciones por rango de fechas y tipo
app.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).send('Start date and end date are required');
      return;
    }
    
    // Validar y convertir fechas
    const start = new Date(startDate.toString());
    const end = new Date(endDate.toString());
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).send('Invalid date format');
      return;
    }
    
    // Validar tipo de transacción si se proporciona
    let transactionType: 'purchase' | 'sale' | undefined = undefined;
    if (type) {
      if (type === 'purchase' || type === 'sale') {
        transactionType = type as 'purchase' | 'sale';
      } else {
        res.status(400).send('Transaction type must be "purchase" or "sale"');
        return;
      }
    }
    
    const transactions = await manager.findTransactionsByDateAndType(start, end, transactionType);
    
    if (transactions.length === 0) {
      res.status(404).send('No transactions found for this date range');
      return;
    }
    
    res.json(transactions);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar transacción por ID
app.put('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await manager.updateTransactionById(req.params.id, req.body);
    if (!transaction) {
      res.status(404).send('Transaction not found');
      return;
    }
    res.json(transaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Eliminar transacción por ID
app.delete('/transactions/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await manager.deleteTransactionById(req.params.id);
    if (!transaction) {
      res.status(404).send('Transaction not found');
      return;
    }
    res.send('Transaction deleted and stock updated');
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Transactions API server listening on port ${PORT}`);
});