import express, { Request, Response, Express } from "express";
import mongoose from 'mongoose';
import { CustomerManager } from './huntersManager.js';

const app: Express = express();
const manager = new CustomerManager();

app.use(express.json());

// Conectarse a MongoDB
mongoose.connect('mongodb://localhost:27017/hunters')
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
app.get('/hunters/:id', (req: Request, res: Response) => {
  manager.findCustomerById(req.params.id)
    .then((hunter) => {
      if (!hunter) return res.status(404).send('Hunter not found');
      res.json(hunter);
    })
    .catch((error) => {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    });
});

// Leer por nombre
app.get('/hunters', (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).send('Name query required'); 
  }

  manager.findCustomerByName(String(name))
    .then((hunter) => {
      if (!hunter) return res.status(404).send('Hunter not found');
      return res.json(hunter);
    })
    .catch((error) => {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      } else {
        return res.status(500).json({ error: 'Unknown error' });
      }
    })
});

// Actualizar por id
app.put('/hunters/:id', (req: Request, res: Response) => {
  manager.updateCustomerById(req.params.id, req.body)
    .then((hunter) => {
      if (!hunter) return res.status(404).send('Hunter not found');
      res.json(hunter);
    })
    .catch((error) => {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    });
});

// Actualizar por nombre
app.put('/hunters', (req: Request, res: Response) => {
  const { name, ...updateData } = req.body;

  manager.updateCustomerByName(name, updateData)
    .then((hunter) => {
      if (!hunter) return res.status(404).send('Hunter not found');
      res.json(hunter);
    })
    .catch((error) => {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    });
});

// Borrar por id
app.delete('/hunters/:id', (req: Request, res: Response) => {
  manager.removeCustomerById(req.params.id)
    .then((hunter) => {
      if (!hunter) return res.status(404).send('Hunter not found');
      res.send('Hunter deleted');
    })
    .catch((error) => {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    });
});

// Borrar por nombre
app.delete('/hunters', (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).send('Name query required'); 
  }

  manager.removeCustomerByName(name.toString())
    .then((hunter) => {
      if (!hunter) return res.status(404).send('Hunter not found'); 
      return res.send('Hunter deleted'); 
    })
    .catch((error) => {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message }); 
      } else {
        return res.status(500).json({ error: 'Unknown error' }); 
      }
    });
});


// Iniciar servidor
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
