import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { Transaction } from '../src/models/transactions.js';
import { Good } from '../src/models/goods.js';
import { Hunter } from '../src/models/hunters.js';
import { Merchant } from '../src/models/merchant.js';

describe('Transactions API', () => {
  // Conexión a la base de datos antes de todas las pruebas
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/posada-lobo-blanco-test");
    }
  });

  // Limpieza antes y después de cada prueba
  beforeEach(async () => {
    await Transaction.deleteMany({});
    await Good.deleteMany({});
    await Hunter.deleteMany({});
    await Merchant.deleteMany({});
  });

  afterEach(async () => {
    await Transaction.deleteMany({});
    await Good.deleteMany({});
    await Hunter.deleteMany({});
    await Merchant.deleteMany({});
  });

  // Función helper para crear datos de prueba consistentes
  const createTestData = async () => {
    const hunter = await Hunter.create({
      name: 'Test Hunter',
      rank: 'A',
      money: 1000
    });

    const merchant = await Merchant.create({
      name: 'Test Merchant',
      location: 'Test Location',
      money: 5000
    });

    const good = await Good.create({
      name: 'Test Good',
      description: 'Test Description',
      category: 'Test',
      material: 'Test',
      value: 100,
      stock: 10,
      weight: 1
    });

    return { hunter, merchant, good };
  };

  describe('POST /transactions', () => {
    it('should create a new purchase transaction and update stock', async () => {
      await createTestData();

      const response = await request(app)
        .post('/transactions')
        .send({
          transactionType: 'purchase',
          personName: 'Test Hunter',
          items: [{ goodName: 'Test Good', quantity: 2 }]
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          transactionType: 'purchase',
          personName: 'Test Hunter',
          items: [{
            goodName: 'Test Good',
            quantity: 2,
            unitPrice: 100
          }],
          totalAmount: 200
        }
      });

      // Verify stock was updated
      const updatedGood = await Good.findOne({ name: 'Test Good' });
      expect(updatedGood?.stock).toBe(8);
    });

    it('should create a new sale transaction and create new good if needed', async () => {
      await createTestData();

      const response = await request(app)
        .post('/transactions')
        .send({
          transactionType: 'sale',
          personName: 'Test Merchant',
          items: [{ goodName: 'New Good', quantity: 5 }]
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          transactionType: 'sale',
          personName: 'Test Merchant',
          items: [{
            goodName: 'New Good',
            quantity: 5
          }]
        }
      });

      // Verify new good was created
      const newGood = await Good.findOne({ name: 'New Good' });
      expect(newGood).toBeTruthy();
      expect(newGood?.stock).toBe(5);
    });

    it('should return 400 for insufficient stock', async () => {
      await createTestData();

      const response = await request(app)
        .post('/transactions')
        .send({
          transactionType: 'purchase',
          personName: 'Test Hunter',
          items: [{ goodName: 'Test Good', quantity: 20 }]
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Stock insuficiente')
      });

      // Verify stock was not changed
      const good = await Good.findOne({ name: 'Test Good' });
      expect(good?.stock).toBe(10);
    });

    it('should return 404 for non-existent person', async () => {
      await createTestData();

      const response = await request(app)
        .post('/transactions')
        .send({
          transactionType: 'purchase',
          personName: 'Non-existent Hunter',
          items: [{ goodName: 'Test Good', quantity: 1 }]
        })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('no encontrado')
      });
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({}) // Missing required fields
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Campos requeridos incompletos o inválidos'
      });
    });
  });

  describe('GET /transactions', () => {
    it('should get all transactions sorted by date descending', async () => {
      const { hunter, merchant, good } = await createTestData();

      // Create test transactions with specific dates
      const transaction1 = await Transaction.create({
        transactionType: 'purchase',
        personId: hunter._id,
        personType: 'Hunter',
        personName: 'Test Hunter',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 2,
          unitPrice: 100
        }],
        totalAmount: 200,
        date: new Date('2023-01-01')
      });

      const transaction2 = await Transaction.create({
        transactionType: 'sale',
        personId: merchant._id,
        personType: 'Merchant',
        personName: 'Test Merchant',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 5,
          unitPrice: 70
        }],
        totalAmount: 350,
        date: new Date('2023-01-02')
      });

      const response = await request(app)
        .get('/transactions')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        count: 2,
        data: expect.arrayContaining([
          expect.objectContaining({
            _id: transaction2._id,
            transactionType: 'sale',
            personName: 'Test Merchant'
          }),
          expect.objectContaining({
            _id: transaction1._id,
            transactionType: 'purchase',
            personName: 'Test Hunter'
          })
        ])
      });

      // Verify sorting by date descending
      const dates = response.body.data.map((t: { date: string }) => new Date(t.date));
      expect(dates[0]).toBe(transaction1.date);
    });

    it('should filter transactions by personName', async () => {
      const { hunter, merchant, good } = await createTestData();

      await Transaction.create([
        {
          transactionType: 'purchase',
          personId: hunter._id,
          personType: 'Hunter',
          personName: 'Test Hunter',
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 2,
            unitPrice: 100
          }],
          totalAmount: 200,
          date: new Date()
        },
        {
          transactionType: 'sale',
          personId: merchant._id,
          personType: 'Merchant',
          personName: 'Test Merchant',
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 5,
            unitPrice: 70
          }],
          totalAmount: 350,
          date: new Date()
        }
      ]);

      const response = await request(app)
        .get('/transactions?personName=Test Hunter')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        count: 1,
        data: [
          expect.objectContaining({
            personName: 'Test Hunter',
            transactionType: 'purchase'
          })
        ]
      });
    });

    it('should filter transactions by date range', async () => {
      const { hunter, good } = await createTestData();

      await Transaction.create([
        {
          transactionType: 'purchase',
          personId: hunter._id,
          personType: 'Hunter',
          personName: 'Test Hunter',
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 2,
            unitPrice: 100
          }],
          totalAmount: 200,
          date: new Date('2023-01-01')
        },
        {
          transactionType: 'purchase',
          personId: hunter._id,
          personType: 'Hunter',
          personName: 'Test Hunter',
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 3,
            unitPrice: 100
          }],
          totalAmount: 300,
          date: new Date('2023-01-15')
        }
      ]);

      const response = await request(app)
        .get('/transactions?startDate=2023-01-10&endDate=2023-01-20')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        count: 1,
        data: [
          expect.objectContaining({
            date: new Date('2023-01-15').toISOString(),
            totalAmount: 300
          })
        ]
      });
    });

    it('should filter transactions by type', async () => {
      const { hunter, merchant, good } = await createTestData();

      await Transaction.create([
        {
          transactionType: 'purchase',
          personId: hunter._id,
          personType: 'Hunter',
          personName: 'Test Hunter',
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 2,
            unitPrice: 100
          }],
          totalAmount: 200,
          date: new Date()
        },
        {
          transactionType: 'sale',
          personId: merchant._id,
          personType: 'Merchant',
          personName: 'Test Merchant',
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 5,
            unitPrice: 70
          }],
          totalAmount: 350,
          date: new Date()
        }
      ]);

      const response = await request(app)
        .get('/transactions?transactionType=sale')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        count: 1,
        data: [
          expect.objectContaining({
            transactionType: 'sale',
            personName: 'Test Merchant'
          })
        ]
      });
    });

    it('should return empty array when no transactions match filters', async () => {
      await createTestData();

      const response = await request(app)
        .get('/transactions?personName=Nonexistent')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        count: 0,
        data: []
      });
    });
  });

  describe('GET /transactions/:id', () => {
    it('should get a transaction by ID', async () => {
      const { hunter, good } = await createTestData();

      const transaction = await Transaction.create({
        transactionType: 'purchase',
        personId: hunter._id,
        personType: 'Hunter',
        personName: 'Test Hunter',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 1,
          unitPrice: 100
        }],
        totalAmount: 100,
        date: new Date()
      });

      const response = await request(app)
        .get(`/transactions/${transaction._id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          _id: transaction._id,
          transactionType: 'purchase',
          personName: 'Test Hunter',
          totalAmount: 100
        })
      });
    });

    it('should return 404 for non-existent transaction ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/transactions/${nonExistentId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Transacción no encontrada'
      });
    });

    it('should return 500 for invalid ID format', async () => {
      const response = await request(app)
        .get('/transactions/invalid-id')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Error al obtener transacción'),
        error: expect.anything()
      });
    });
  });

  describe('PATCH /transactions/:id', () => {
    it('should update transaction details', async () => {
      const { hunter, good } = await createTestData();

      const transaction = await Transaction.create({
        transactionType: 'purchase',
        personId: hunter._id,
        personType: 'Hunter',
        personName: 'Test Hunter',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 1,
          unitPrice: 100
        }],
        totalAmount: 100,
        date: new Date()
      });

      const response = await request(app)
        .patch(`/transactions/${transaction._id}`)
        .send({
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 2,
            unitPrice: 100
          }],
          totalAmount: 200
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          _id: transaction._id,
          items: [
            expect.objectContaining({
              quantity: 2
            })
          ],
          totalAmount: 200
        })
      });
    });

    it('should not allow changing transaction type or person', async () => {
      const { hunter, merchant, good } = await createTestData();

      const transaction = await Transaction.create({
        transactionType: 'purchase',
        personId: hunter._id,
        personType: 'Hunter',
        personName: 'Test Hunter',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 1,
          unitPrice: 100
        }],
        totalAmount: 100,
        date: new Date()
      });

      const response = await request(app)
        .patch(`/transactions/${transaction._id}`)
        .send({
          transactionType: 'sale',
          personName: 'Test Merchant',
          personId: merchant._id,
          personType: 'Merchant'
        })
        .expect(200);

      // Verify immutable fields didn't change
      expect(response.body.data.transactionType).toBe('purchase');
      expect(response.body.data.personName).toBe('Test Hunter');
      expect(response.body.data.personType).toBe('Hunter');
    });

    it('should return 404 for non-existent transaction ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/transactions/${nonExistentId}`)
        .send({ totalAmount: 200 })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Transacción no encontrada'
      });
    });

    it('should handle stock adjustments when updating', async () => {
      const { hunter, good } = await createTestData();

      const transaction = await Transaction.create({
        transactionType: 'purchase',
        personId: hunter._id,
        personType: 'Hunter',
        personName: 'Test Hunter',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 2,
          unitPrice: 100
        }],
        totalAmount: 200,
        date: new Date()
      });

      // Original stock was 10, purchased 2, so current stock is 8
      const goodBeforeUpdate = await Good.findById(good._id);
      expect(goodBeforeUpdate?.stock).toBe(8);

      // Update to purchase 3 instead of 2 (increase by 1)
      await request(app)
        .patch(`/transactions/${transaction._id}`)
        .send({
          items: [{
            goodId: good._id,
            goodName: 'Test Good',
            quantity: 3,
            unitPrice: 100
          }],
          totalAmount: 300
        })
        .expect(200);

      // Verify stock was adjusted (8 + 2 original - 3 new = 7)
      const goodAfterUpdate = await Good.findById(good._id);
      expect(goodAfterUpdate?.stock).toBe(7);
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should delete a transaction and restore stock', async () => {
      const { hunter, good } = await createTestData();

      const transaction = await Transaction.create({
        transactionType: 'purchase',
        personId: hunter._id,
        personType: 'Hunter',
        personName: 'Test Hunter',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 2,
          unitPrice: 100
        }],
        totalAmount: 200,
        date: new Date()
      });

      // Verify stock was reduced
      const goodBeforeDelete = await Good.findById(good._id);
      expect(goodBeforeDelete?.stock).toBe(8); // 10 - 2

      const response = await request(app)
        .delete(`/transactions/${transaction._id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Transacción eliminada correctamente'
      });

      // Verify transaction is gone
      const deletedTransaction = await Transaction.findById(transaction._id);
      expect(deletedTransaction).toBeNull();

      // Verify stock was restored
      const goodAfterDelete = await Good.findById(good._id);
      expect(goodAfterDelete?.stock).toBe(10);
    });

    it('should handle sale transaction stock correctly on delete', async () => {
      const { merchant, good } = await createTestData();

      const transaction = await Transaction.create({
        transactionType: 'sale',
        personId: merchant._id,
        personType: 'Merchant',
        personName: 'Test Merchant',
        items: [{
          goodId: good._id,
          goodName: 'Test Good',
          quantity: 5,
          unitPrice: 70
        }],
        totalAmount: 350,
        date: new Date()
      });

      // Verify stock was increased (sale adds to inventory)
      const goodBeforeDelete = await Good.findById(good._id);
      expect(goodBeforeDelete?.stock).toBe(15); // 10 + 5

      await request(app)
        .delete(`/transactions/${transaction._id}`)
        .expect(200);

      // Verify stock was reduced back to original
      const goodAfterDelete = await Good.findById(good._id);
      expect(goodAfterDelete?.stock).toBe(10);
    });

    it('should return 404 for non-existent transaction ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/transactions/${nonExistentId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Transacción no encontrada'
      });
    });

    it('should return 400 if stock would go negative when deleting', async () => {
      const { merchant } = await createTestData();

      // Create a good with low stock
      const lowStockGood = await Good.create({
        name: 'Low Stock Good',
        description: 'Test',
        category: 'Test',
        material: 'Test',
        value: 100,
        stock: 1, // Very low stock
        weight: 1
      });

      const transaction = await Transaction.create({
        transactionType: 'sale',
        personId: merchant._id,
        personType: 'Merchant',
        personName: 'Test Merchant',
        items: [{
          goodId: lowStockGood._id,
          goodName: 'Low Stock Good',
          quantity: 5,
          unitPrice: 70
        }],
        totalAmount: 350,
        date: new Date()
      });

      // Manually reduce stock to simulate concurrent operations
      await Good.findByIdAndUpdate(lowStockGood._id, { stock: 0 });

      const response = await request(app)
        .delete(`/transactions/${transaction._id}`)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: expect.stringContaining('Stock insuficiente')
      });
    });
  });
});