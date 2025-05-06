import  express from 'express';
import { Types } from 'mongoose';
import { Transaction } from '../models/transactions.js';
import { Good } from '../models/goods.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchants.js';


export const APItransaction = express.Router();


// --- Helper functions ---


/**
 * Valida que el array de bienes tenga estructura correcta
 */
function validateGoodsInput(goods: any): goods is Array<{ name: string; cantidad: number; [key: string]: any }> {
  return Array.isArray(goods) && goods.length > 0 && goods.every(item =>
    typeof item.name === 'string' &&
    typeof item.cantidad === 'number' && item.cantidad > 0
  );
}


/**
 * Calcula el importe total de items procesados
 */
function computeTotalAmount(items: Array<{ unitPrice: number; cantidad: number }>): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.cantidad, 0);
}


/**
 * Ajusta stock al crear una transacción
 */
async function adjustStockOnCreate(
  tipo: 'compra' | 'venta',
  goodsInput: Array<any>
): Promise<Array<{ bien: Types.ObjectId; cantidad: number; unitPrice: number }>> {
  const processed: Array<{ bien: Types.ObjectId; cantidad: number; unitPrice: number }> = [];
  for (const item of goodsInput) {
    const { name, cantidad } = item;
    let bien = await Good.findOne({ name });
    if (tipo === 'compra') {
      if (!bien || bien.stock < cantidad) throw { status: 400, message: 'Stock insuficiente o bien no encontrado' };
      bien.stock -= cantidad;
    } else {
      if (!bien) {
        bien = new Good({
          name,
          description: item.description || 'Sin descripción',
          category: item.category || 'Other',
          material: item.material || 'Desconocido',
          value: item.value || 0,
          stock: cantidad,
          weight: item.weight || 1
        });
      } else {
        bien.stock += cantidad;
      }
    }
    if (bien.stock <= 0) {
      await Good.deleteOne({ _id: bien._id });
    } else {
      await bien.save();
    }
    processed.push({ bien: bien._id, cantidad, unitPrice: bien.value });
  }
  return processed;
}


/**
 * Ajusta stock al actualizar una transacción
 */
async function adjustStockOnUpdate(
  original: typeof Transaction.prototype,
  nuevoGoods: Array<any>
): Promise<Array<{ bien: Types.ObjectId; cantidad: number; unitPrice: number }>> {
  // Revertir stock de original
  for (const item of original.bienes) {
    const bien = await Good.findById(item.bien);
    if (!bien) continue;
    bien.stock += (original.tipo === 'compra' ? item.cantidad : -item.cantidad);
    if (bien.stock <= 0) await Good.deleteOne({ _id: bien._id });
    else await bien.save();
  }
  // Aplicar nuevo stock
  return adjustStockOnCreate(original.tipo, nuevoGoods);
}


/**
 * Ajusta stock y crea transacción de devolución al borrar
 */
async function adjustStockOnDelete(
  trans: typeof Transaction.prototype
): Promise<Array<{ bien: Types.ObjectId; cantidad: number }>> {
  const retorno: Array<{ bien: Types.ObjectId; cantidad: number }> = [];
  for (const item of trans.bienes) {
    const bien = await Good.findById(item.bien);
    if (!bien) continue;
    bien.stock += (trans.tipo === 'compra' ? item.cantidad : -item.cantidad);
    if (bien.stock <= 0) await Good.deleteOne({ _id: bien._id });
    else await bien.save();
    retorno.push({ bien: bien._id, cantidad: item.cantidad });
  }
  return retorno;
}




/**
 * @route POST /transactions
 * @description Crea una transacción (compra o venta) y ajusta el stock de bienes.
 */
APItransaction.post('/transactions', async (req, res) => {
  try {
    const { id, tipo, name, goods } = req.body;


    // Validaciones básicas
    if (!id || !tipo || !name || !validateGoodsInput(goods)) {
      return res.status(400).send({ error: 'Payload inválido' });
    }
    if (await Transaction.findOne({ id })) {
      return res.status(400).send({ error: 'ID duplicado' });
    }
    if (!['compra', 'venta'].includes(tipo)) {
      return res.status(400).send({ error: 'Tipo inválido' });
    }
    const persona = tipo === 'compra'
      ? await Hunter.findOne({ name })
      : await Merchant.findOne({ name });
    if (!persona) return res.status(404).send({ error: 'Persona no encontrada' });


    // Ajuste de stock y cálculo
    const processed = await adjustStockOnCreate(tipo, goods);
    const totalAmount = computeTotalAmount(processed);


    const newTrans = new Transaction({
      id,
      tipo,
      cazador: tipo === 'compra' ? persona._id : undefined,
      mercader: tipo === 'venta' ? persona._id : undefined,
      bienes: processed.map(p => ({ bien: p.bien, cantidad: p.cantidad })),
      fecha: new Date(),
      valor: totalAmount
    });
    await newTrans.save();
    res.status(201).send(newTrans);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).send({ error: err.message || 'Error del servidor' });
  }
});


/**
 * @route GET /transactions/nombre
 * @description Obtiene transacciones por nombre de cazador o mercader.
 */
APItransaction.get('/transactions/nombre', async (req, res) => {
  try {
    const name = req.query.name as string;
    if (!name) return res.status(400).send({ error: 'Falta parámetro name' });


    const hunter = await Hunter.findOne({ name });
    const merchant = await Merchant.findOne({ name });
    if (!hunter && !merchant) return res.status(404).send({ error: 'Persona no encontrada' });


    const txs = [] as any[];
    if (hunter) txs.push(...await Transaction.find({ cazador: hunter._id }));
    if (merchant) txs.push(...await Transaction.find({ mercader: merchant._id }));
    res.send(txs);
  } catch (error) {
    res.status(500).send({ error: 'Error del servidor' });
  }
});


/**
 * @route GET /transactions/fecha
 * @description Obtiene transacciones por rango de fechas y tipo.
 */
APItransaction.get('/transactions/fecha', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo } = req.query;
    const filter: any = {};
    if (fechaInicio) filter.fecha = { ...filter.fecha, $gte: new Date(fechaInicio as string) };
    if (fechaFin) filter.fecha = { ...filter.fecha, $lte: new Date(fechaFin as string) };
    if (['compra', 'venta'].includes(tipo as string)) filter.tipo = tipo;


    const txs = await Transaction.find(filter);
    res.send(txs);
  } catch (error) {
    res.status(500).send({ error: 'Error del servidor' });
  }
});


/**
 * @route GET /transactions/:id
 * @description Obtiene una transacción por su ID interno.
 */
APItransaction.get('/transactions/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).send({ error: 'Transacción no encontrada' });
    res.send(tx);
  } catch (error) {
    res.status(500).send({ error: 'Error del servidor' });
  }
});


/**
 * @route PATCH /transactions/:id
 * @description Actualiza únicamente los bienes de una transacción y reajusta el stock.
 */
APItransaction.patch('/transactions/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).send({ error: 'Transacción no encontrada' });
    const { goods } = req.body;
    if (!validateGoodsInput(goods)) return res.status(400).send({ error: 'Payload inválido' });


    const processed = await adjustStockOnUpdate(tx, goods);
    tx.bienes = processed.map(p => ({ bien: p.bien, cantidad: p.cantidad }));
    tx.valor = computeTotalAmount(processed);
    await tx.save();
    res.send(tx);
  } catch (err: any) {
    res.status(err.status || 500).send({ error: err.message || 'Error del servidor' });
  }
});


/**
 * @route DELETE /transactions/:id
 * @description Elimina una transacción y crea su devolución (reversión de stock).
 */
APItransaction.delete('/transactions/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).send({ error: 'Transacción no encontrada' });


    const retorno = await adjustStockOnDelete(tx);
    const last = await Transaction.findOne().sort({ id: -1 }).exec();
    const newId = last ? last.id + 1 : 1;


    const devol = new Transaction({
      id: newId,
      tipo: 'devolucion',
      cazador: tx.tipo === 'compra' ? tx.cazador : undefined,
      mercader: tx.tipo === 'venta' ? tx.mercader : undefined,
      bienes: retorno,
      fecha: new Date(),
      valor: computeTotalAmount(retorno.map(r => ({ cantidad: r.cantidad, unitPrice: 0 })))
    });
    await devol.save();
    await tx.deleteOne();
    res.send(devol);
  } catch (err: any) {
    res.status(err.status || 500).send({ error: err.message || 'Error del servidor' });
  }
});






