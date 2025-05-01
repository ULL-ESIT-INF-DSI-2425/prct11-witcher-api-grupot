/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, Express } from "express";
import mongoose from 'mongoose';
import { CustomerManager } from './huntersManager.js';
import { MerchantManager } from './merchantManager.js';
import { GoodManager } from './goodsManager.js';
import { TransactionManager } from './transactionsManager.js';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const hunterManager = new CustomerManager();
const merchantManager = new MerchantManager();
const goodManager = new GoodManager();
const transactionManager = new TransactionManager();

app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://alu0101545455:@clusterprincipal.mkyvmkc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPrincipal';

// Conectarse a MongoDB ATLAS
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error', err));

// Ruta de inicio
app.get('/', (req: Request, res: Response) => {
  res.send('Witcher Trading Post API - Welcome!');
});

// --------------------- RUTAS PARA CAZADORES --------------------- //

// Crear un cazador
app.post('/hunters', async (req: Request, res: Response) => {
  try {
    const { name, race, location } = req.body;
    const customer = await hunterManager.addCustomer(name, race, location);
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer por id
app.get('/hunters/:id', async (req: Request, res: Response) => {
  try {
    const hunter = await hunterManager.findCustomerById(req.params.id);
    if (!hunter) {
      res.status(404).send('Hunter not found');
      return;
    }
    res.json(hunter);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer por nombre
app.get('/hunters', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).send('Name query required');
      return;
    }

    const hunter = await hunterManager.findCustomerByName(String(name));
    if (!hunter) {
      res.status(404).send('Hunter not found');
      return;
    }
    res.json(hunter);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar por id
app.put('/hunters/:id', async (req: Request, res: Response) => {
  try {
    const hunter = await hunterManager.updateCustomerById(req.params.id, req.body);
    if (!hunter) {
      res.status(404).send('Hunter not found');
      return;
    }
    res.json(hunter);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar por nombre
app.put('/hunters', async (req: Request, res: Response) => {
  try {
    const { name, ...updateData } = req.body;
    const hunter = await hunterManager.updateCustomerByName(name, updateData);
    if (!hunter) {
      res.status(404).send('Hunter not found');
      return;
    }
    res.json(hunter);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Borrar por id
app.delete('/hunters/:id', async (req: Request, res: Response) => {
  try {
    const hunter = await hunterManager.removeCustomerById(req.params.id);
    if (!hunter) {
      res.status(404).send('Hunter not found');
      return;
    }
    res.send('Hunter deleted');
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Borrar por nombre
app.delete('/hunters', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).send('Name query required');
      return;
    }

    const hunter = await hunterManager.removeCustomerByName(name.toString());
    if (!hunter) {
      res.status(404).send('Hunter not found');
      return;
    }
    res.send('Hunter deleted');
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// --------------------- RUTAS PARA MERCADERES --------------------- //

// Crear un mercader
app.post('/merchants', async (req: Request, res: Response) => {
  try {
    const { name, type, location } = req.body;
    const merchant = await merchantManager.addMerchant(name, type, location);
    res.status(201).json(merchant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer por id
app.get('/merchants/:id', async (req: Request, res: Response) => {
  try {
    const merchant = await merchantManager.findMerchantById(req.params.id);
    if (!merchant) {
      res.status(404).send('Merchant not found');
      return;
    }
    res.json(merchant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer por nombre
app.get('/merchants', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).send('Name query required');
      return;
    }

    const merchant = await merchantManager.findMerchantByName(String(name));
    if (!merchant) {
      res.status(404).send('Merchant not found');
      return;
    }
    res.json(merchant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar por id
app.put('/merchants/:id', async (req: Request, res: Response) => {
  try {
    const merchant = await merchantManager.updateMerchantById(req.params.id, req.body);
    if (!merchant) {
      res.status(404).send('Merchant not found');
      return;
    }
    res.json(merchant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar por nombre
app.put('/merchants', async (req: Request, res: Response) => {
  try {
    const { name, ...updateData } = req.body;
    const merchant = await merchantManager.updateMerchantByName(name, updateData);
    if (!merchant) {
      res.status(404).send('Merchant not found');
      return;
    }
    res.json(merchant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Borrar por id
app.delete('/merchants/:id', async (req: Request, res: Response) => {
  try {
    const merchant = await merchantManager.removeMerchantById(req.params.id);
    if (!merchant) {
      res.status(404).send('Merchant not found');
      return;
    }
    res.send('Merchant deleted');
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Borrar por nombre
app.delete('/merchants', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).send('Name query required');
      return;
    }

    const merchant = await merchantManager.removeMerchantByName(name.toString());
    if (!merchant) {
      res.status(404).send('Merchant not found');
      return;
    }
    res.send('Merchant deleted');
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// --------------------- RUTAS PARA BIENES --------------------- //

// Crear un bien
app.post('/goods', async (req: Request, res: Response) => {
  try {
    const good = await goodManager.addGood(req.body);
    res.status(201).json(good);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer por id
app.get('/goods/:id', async (req: Request, res: Response) => {
  try {
    const good = await goodManager.findGoodById(req.params.id);
    if (!good) {
      res.status(404).send('Good not found');
      return;
    }
    res.json(good);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Leer por query string (nombre, descripción, categoría)
app.get('/goods', async (req: Request, res: Response) => {
  try {
    const query: any = {};
    
    // Construir la consulta basada en los parámetros proporcionados
    if (req.query.name) {
      query.name = req.query.name;
    }
    
    if (req.query.description) {
      query.description = { $regex: req.query.description, $options: 'i' }; // busqueda insensible a mayúsculas
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.material) {
      query.material = req.query.material;
    }

    // Si no hay parámetros de búsqueda, devolver un error
    if (Object.keys(query).length === 0) {
      res.status(400).send('At least one search parameter is required');
      return;
    }

    const goods = await goodManager.findGoodsByQuery(query);
    
    if (goods.length === 0) {
      res.status(404).send('No goods found matching the criteria');
      return;
    }
    
    res.json(goods);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar por id
app.put('/goods/:id', async (req: Request, res: Response) => {
  try {
    const good = await goodManager.updateGoodById(req.params.id, req.body);
    if (!good) {
      res.status(404).send('Good not found');
      return;
    }
    res.json(good);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Actualizar por nombre
app.put('/goods', async (req: Request, res: Response) => {
  try {
    const { name, ...updateData } = req.body;
    
    if (!name) {
      res.status(400).send('Name is required in the request body');
      return;
    }
    
    const good = await goodManager.updateGoodByName(name, updateData);
    if (!good) {
      res.status(404).send('Good not found');
      return;
    }
    res.json(good);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Borrar por id
app.delete('/goods/:id', async (req: Request, res: Response) => {
  try {
    const good = await goodManager.removeGoodById(req.params.id);
    if (!good) {
      res.status(404).send('Good not found');
      return;
    }
    res.send('Good deleted');
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Borrar por nombre
app.delete('/goods', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).send('Name query parameter is required');
      return;
    }

    const good = await goodManager.removeGoodByName(name.toString());
    if (!good) {
      res.status(404).send('Good not found');
      return;
    }
    res.send('Good deleted');
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// --------------------- RUTAS PARA TRANSACCIONES --------------------- //

// Crear una transacción de venta a un cazador
app.post('/transactions/sale', async (req: Request, res: Response) => {
  try {
    const { hunterName, items } = req.body;
    
    if (!hunterName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).send('Hunter name and items array are required');
      return;
    }
    
    const transaction = await transactionManager.createSaleTransaction(hunterName, items);
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
    
    const transaction = await transactionManager.createPurchaseTransaction(merchantName, items);
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
    const transaction = await transactionManager.findTransactionById(req.params.id);
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
    const transactions = await transactionManager.findTransactionsByPersonName(req.params.name);
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
    
    const transactions = await transactionManager.findTransactionsByDateAndType(start, end, transactionType);
    
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
    const transaction = await transactionManager.updateTransactionById(req.params.id, req.body);
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
    const transaction = await transactionManager.deleteTransactionById(req.params.id);
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Witcher Trading Post API server running on port ${PORT}`);
});