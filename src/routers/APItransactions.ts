import express from 'express';
import { createTransaction, deleteTransaction, getTransactions, getTransactionById, updateTransaction } from '../controllers/transactionsControler.js';

export const APItransactions = express.Router();

/**
 * @route POST /transactions
 * @description Crea un una transaccion.
 *
 * @param {string} req.body.transactionType - Tipo de transaccion (purchase o sale)
 * @param {string} req.body.personName - nombre de la persona
 * @param {string} req.body.items - Array de items que se han involucrado en la compra-venta.
 * @param {string} req.body.items.goodName - nombre del item intercambiado
 * @param {string} req.body.items.quantity - cantidad de objetos del mismo tipo
 * @param {string} req.body.items.unitPrice - precio por unidad
 * @param {string} req.body.totalAmount - valor total de la compra-venta (precio * cantidad del mismo objeto)
 * 
 * 
 * @returns {201 Created} Transaccion creada correctamente.
 * @returns {400 Bad Request} Campos incompletos
 * @returns {404 Bad Request} Persona no encontrada / bien no encontrado
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * POST /transactions
 * {
 *  "transactionType": "sale",
 *   "personId": "681b242294df3b959fae02b5",
 *   "personType": "Merchant",
 *   "personName": "mercante",
 *   "items": [
 *       {
 *           "goodId": "681a5f5fa82b8d3e539777b6",
 *           "goodName": "cascanueces",
 *           "quantity": 2,
 *           "unitPrice": 8
 *       }
 *   ],
 *   "totalAmount": 2,
 * }
 */
APItransactions.post('/transactions', async (req, res) => {
  await createTransaction(req, res);
});

/**
 * @route GET /transactions
 * @description Devuelve transacciones según los filtros aplicados.
 *
 * @param {string} req.query.personName - Filtro por el nombre de una persona.
 * @param {string} req.query.startDate - Filtro por el inicio de una fecha (se requiere de una fecha posterior "endDate").
 * @param {string} req.query.endDate - Filtro por el final de una fecha (se requiere de una fecha anterior "startDate").
 * @param {string} req.query.transactionType - Filtro por el tipo de transaccion (purchase / sale / all).
 * 
 * 
 * @returns {200 Found} Transacciones encontradas y devueltas.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET transactions?startDate=2025-5-7&endDate=2025-5-8
 */
APItransactions.get('/transactions', async (req, res) => {
  await getTransactions(req, res);
});

/**
 * @route GET /transactions/:id
 * @description Devuelve transacciones según un id dado.
 *
 * @param {string} req.param.id - Id de la transaccion que se quiere consultar.
 * 
 * 
 * @returns {200 Found} Transaccion encontrada y devuelta.
 * @returns {404 Not Found} Transaccion no encontrada.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * GET transactions/681a5f5fa82b8d3e539777b6
 */
APItransactions.get('/transactions/:id', async (req, res) => {
  await getTransactionById(req, res);
});

/**
 * @route PATCH /transactions/:id
 * @description Edita un una transaccion.
 *
 * @param {string} req.param.id - Id de la transaccion a editar
 * @param {string} req.body.transactionType - Tipo de transaccion (purchase o sale)
 * @param {string} req.body.personName - nombre de la persona
 * @param {string} req.body.items - Array de items que se han involucrado en la compra-venta.
 * @param {string} req.body.items.goodName - nombre del item intercambiado
 * @param {string} req.body.items.quantity - cantidad de objetos del mismo tipo
 * @param {string} req.body.items.unitPrice - precio por unidad
 * @param {string} req.body.totalAmount - valor total de la compra-venta (precio * cantidad del mismo objeto)
 * 
 * 
 * @returns {201 Created} Transaccion editada correctamente.
 * @returns {400 Bad Request} No se encuentra el stock suficiente 
 * @returns {404 Not Found} Transaccion no encontrada.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * POST /transactions
 * {
 *   "totalAmount": 34,
 * }
 */
APItransactions.patch('/transactions/:id', async (req, res) => {
  await updateTransaction(req, res);
});

/**
 * @route DELETE /transactions/:id
 * @description Elimina una transaccion según un id dado.
 *
 * @param {string} req.param.id - Id de la transaccion que se quiere eliminar.
 * 
 * 
 * @returns {200 Found} Transaccion encontrada y eliminada.
 * @returns {404 Not Found} Transaccion no encontrada.
 * @returns {400 Bad Request} Transaccion no eliminada por motivos de stock.
 * @returns {500 Internal Server Error} Error del servidor.
 *
 * @example
 * DELETE transactions/681a5f5fa82b8d3e539777b6
 */
APItransactions.delete('/transactions/:id', async (req, res) => {
  await deleteTransaction(req, res);
});