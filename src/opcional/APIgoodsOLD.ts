// /* eslint-disable @typescript-eslint/no-explicit-any */
// import express, { Request, Response, Express } from "express";
// import mongoose from 'mongoose';
// import { GoodManager } from './goodsManager.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const app: Express = express();
// const manager = new GoodManager();

// app.use(express.json());

// const mongoURI = process.env.MONGODB_URI || "mongodb+srv://alu0101545455:@clusterprincipal.mkyvmkc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPrincipal";

// // Conectarse a MongoDB ATLAS
// mongoose.connect(mongoURI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('Connection error', err));

// // Crear un bien
// app.post('/goods', async (req: Request, res: Response) => {
//   try {
//     const good = await manager.addGood(req.body);
//     res.status(201).json(good);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Leer por id
// app.get('/goods/:id', async (req: Request, res: Response) => {
//   try {
//     const good = await manager.findGoodById(req.params.id);
//     if (!good) {
//       res.status(404).send('Good not found');
//       return;
//     }
//     res.json(good);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Leer por query string (nombre, descripción, categoría)
// app.get('/goods', async (req: Request, res: Response) => {
//   try {
//     const query: any = {};
    
//     // Construir la consulta basada en los parámetros proporcionados
//     if (req.query.name) {
//       query.name = req.query.name;
//     }
    
//     if (req.query.description) {
//       query.description = { $regex: req.query.description, $options: 'i' }; // busqueda insensible a mayúsculas
//     }
    
//     if (req.query.category) {
//       query.category = req.query.category;
//     }

//     if (req.query.material) {
//       query.material = req.query.material;
//     }

//     // Si no hay parámetros de búsqueda, devolver un error
//     if (Object.keys(query).length === 0) {
//       res.status(400).send('At least one search parameter is required');
//       return;
//     }

//     const goods = await manager.findGoodsByQuery(query);
    
//     if (goods.length === 0) {
//       res.status(404).send('No goods found matching the criteria');
//       return;
//     }
    
//     res.json(goods);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Actualizar por id
// app.put('/goods/:id', async (req: Request, res: Response) => {
//   try {
//     const good = await manager.updateGoodById(req.params.id, req.body);
//     if (!good) {
//       res.status(404).send('Good not found');
//       return;
//     }
//     res.json(good);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Actualizar por nombre
// app.put('/goods', async (req: Request, res: Response) => {
//   try {
//     const { name, ...updateData } = req.body;
    
//     if (!name) {
//       res.status(400).send('Name is required in the request body');
//       return;
//     }
    
//     const good = await manager.updateGoodByName(name, updateData);
//     if (!good) {
//       res.status(404).send('Good not found');
//       return;
//     }
//     res.json(good);
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Borrar por id
// app.delete('/goods/:id', async (req: Request, res: Response) => {
//   try {
//     const good = await manager.removeGoodById(req.params.id);
//     if (!good) {
//       res.status(404).send('Good not found');
//       return;
//     }
//     res.send('Good deleted');
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Borrar por nombre
// app.delete('/goods', async (req: Request, res: Response) => {
//   try {
//     const { name } = req.query;
//     if (!name) {
//       res.status(400).send('Name query parameter is required');
//       return;
//     }

//     const good = await manager.removeGoodByName(name.toString());
//     if (!good) {
//       res.status(404).send('Good not found');
//       return;
//     }
//     res.send('Good deleted');
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'Unknown error' });
//     }
//   }
// });

// // Iniciar servidor
// const PORT = process.env.PORT || 3002;
// app.listen(PORT, () => {
//   console.log(`Goods API server listening on port ${PORT}`);
// });