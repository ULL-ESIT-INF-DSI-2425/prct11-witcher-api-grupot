import express, { Request, Response, Express } from "express";
import mongoose from 'mongoose';
import { CustomerManager } from './huntersManager.js';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const manager = new CustomerManager();

app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://alu0101545455:@clusterprincipal.mkyvmkc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPrincipal';

// Conectarse a MongoDB ATLAS
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error', err));

// Crear un cazador
app.post('/hunters', async (req: Request, res: Response) => {
  try {
    const { name, race, location } = req.body;
    const customer = await manager.addCustomer(name, race, location);
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
    const hunter = await manager.findCustomerById(req.params.id);
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

    const hunter = await manager.findCustomerByName(String(name));
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
    const hunter = await manager.updateCustomerById(req.params.id, req.body);
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
    const hunter = await manager.updateCustomerByName(name, updateData);
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
    const hunter = await manager.removeCustomerById(req.params.id);
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

    const hunter = await manager.removeCustomerByName(name.toString());
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});