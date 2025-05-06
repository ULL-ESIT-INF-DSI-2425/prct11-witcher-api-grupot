import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { Merchant } from '../src/models/merchant.js';
import { Hunter } from '../src/models/hunters.js';
import { Good } from '../src/models/goods.js';
import { Transaction } from '../src/models/transactions.js';


// Única conexión a la DB de pruebas
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/posada-lobo-blanco-test');
  }
});


afterEach(async () => {
  await Promise.all([
    Merchant.deleteMany({}),
    Hunter.deleteMany({}),
    Good.deleteMany({}),
    Transaction.deleteMany({})
  ]);
});




describe('Merchants API Tests', () => {
  describe('POST /merchant', () => {
    test('should create a new merchant', async () => {
      const res = await request(app)
        .post('/merchant')
        .send({ name: 'Boris', type: 'General Goods', location: 'Rivia' })
        .expect(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Boris');
      expect(res.body.type).toBe('General Goods');
      expect(res.body.location).toBe('Rivia');
    });


    test('should return 400 if missing fields', async () => {
      await request(app)
        .post('/merchant')
        .send({ type: 'Alchemist' })
        .expect(400);
    });
  });


  describe('PATCH /transactions?id=', () => {
    test('should update goods field via query ID', async () => {
      const merchant = await Merchant.create({ name: 'Zoltan', type: 'Weapons', location: 'Novigrad' });
      const good = await Good.create({ name: 'Sword', description: 'Sharp', category: 'Weapon', material: 'Steel', value: 100, stock: 10, weight: 5 });
      const tx = await Transaction.create({ id: 1, tipo: 'venta', mercader: merchant._id, bienes: [{ bien: good._id, cantidad: 2 }], fecha: new Date(), valor: 200 });
     
      const patchData = { goods: [{ name: 'Sword', cantidad: 3 }] };
      const res = await request(app)
        .patch(`/transactions?id=${tx.id}`)
        .send(patchData)
        .expect(200);
      expect(res.body).toHaveProperty('bienes');
      expect(res.body.bienes[0].cantidad).toBe(3);
      expect(res.body.valor).toBe(300);
    });
  });


  describe('DELETE /transactions?id=', () => {
    test('should delete transaction via query ID', async () => {
      const merchant = await Merchant.create({ name: 'Boris', type: 'Herbalist', location: 'Oxenfurt' });
      const good = await Good.create({ name: 'Herb', description: 'Healing', category: 'Ingredient', material: 'Plant', value: 50, stock: 5, weight: 1 });
      const tx = await Transaction.create({ id: 2, tipo: 'venta', mercader: merchant._id, bienes: [{ bien: good._id, cantidad: 1 }], fecha: new Date(), valor: 50 });


      const res = await request(app)
        .delete(`/transactions?id=${tx.id}`)
        .expect(200);
      expect(res.body).toHaveProperty('tipo', 'devolucion');
      expect(res.body.bienes[0].cantidad).toBe(1);
    });
  });
});




describe('Transactions API Tests', () => {
  let hunterId: mongoose.Types.ObjectId;
  let merchantId: mongoose.Types.ObjectId;
  let goodId: mongoose.Types.ObjectId;


  beforeAll(async () => {
    // Prepara cazador, mercader y bien para pruebas de transacciones
    const hunter = await Hunter.create({ name: 'Geralt', race: 'Human', location: 'Kaer Morhen' });
    const merchant = await Merchant.create({ name: 'Dandelion', type: 'General Goods', location: 'Novigrad' });
    const good = await Good.create({ name: 'Lute', description: 'Musical', category: 'Tool', material: 'Wood', value: 200, stock: 5, weight: 3 });
    hunterId = hunter._id;
    merchantId = merchant._id;
    goodId = good._id;
  });


  test('POST /transactions should create transaction compra', async () => {
    const payload = {
      id: 10,
      tipo: 'compra',
      name: 'Geralt',
      goods: [{ name: 'Lute', cantidad: 2 }]
    };
    const res = await request(app)
      .post('/transactions')
      .send(payload)
      .expect(201);
    expect(res.body.tipo).toBe('compra');
    expect(res.body.valor).toBe(400);
  });


  test('POST /transactions should fail for unknown hunter', async () => {
    await request(app)
      .post('/transactions')
      .send({ id: 11, tipo: 'compra', name: 'Unknown', goods: [{ name: 'Lute', cantidad: 1 }] })
      .expect(404);
  });


  test('GET /transactions/nombre returns transactions array', async () => {
    const res = await request(app)
      .get('/transactions/nombre')
      .query({ name: 'Geralt' })
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});



