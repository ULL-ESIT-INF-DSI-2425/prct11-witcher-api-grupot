/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction, TransactionDocumentInterface, TransactionItemInterface } from './transactions.js';
import { Good } from './goods.js';
import { Hunter } from './hunters.js';
import { Merchant } from './merchant.js';
import { Types } from 'mongoose';

export class TransactionManager {

  /**
   * Crea una transacción de venta a un cazador
   */
  async createSaleTransaction(hunterName: string, items: Array<{ goodName: string, quantity: number }>) {
    // Verificar que el cazador existe
    const hunter = await Hunter.findOne({ name: hunterName });
    if (!hunter) {
      throw new Error(`Hunter ${hunterName} not found`);
    }

    // Preparar los items de la transacción
    const transactionItems: TransactionItemInterface[] = [];
    let totalAmount = 0;

    // Verificar y procesar cada item solicitado
    for (const item of items) {
      const good = await Good.findOne({ name: item.goodName });
      if (!good) {
        throw new Error(`Good ${item.goodName} not found`);
      }

      // Verificar stock disponible
      if (good.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.goodName}. Available: ${good.stock}, requested: ${item.quantity}`);
      }

      // Restar stock
      good.stock -= item.quantity;
      await good.save();

      // Añadir item a la transacción
      transactionItems.push({
        goodId: good._id as Types.ObjectId,
        goodName: good.name,
        quantity: item.quantity,
        unitPrice: good.value
      });

      totalAmount += good.value * item.quantity;
    }

    // Crear y guardar transacción
    const transaction = new Transaction({
      transactionType: 'sale',
      personId: hunter._id,
      personType: 'Hunter',
      personName: hunter.name,
      items: transactionItems,
      totalAmount: totalAmount
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Crea una transacción de compra a un mercader
   */
  async createPurchaseTransaction(merchantName: string, items: Array<{ goodName: string, quantity: number, value?: number, description?: string, category?: string, material?: string, weight?: number }>) {
    // Verificar que el mercader existe
    const merchant = await Merchant.findOne({ name: merchantName });
    if (!merchant) {
      throw new Error(`Merchant ${merchantName} not found`);
    }

    // Preparar los items de la transacción
    const transactionItems: TransactionItemInterface[] = [];
    let totalAmount = 0;

    // Verificar y procesar cada item ofrecido
    for (const item of items) {
      let good = await Good.findOne({ name: item.goodName });
      
      // Si el bien no existe, crearlo
      if (!good) {
        if (!item.value || !item.description || !item.category || !item.material) {
          throw new Error(`Good ${item.goodName} doesn't exist and lacks required information to create it`);
        }

        good = new Good({
          name: item.goodName,
          description: item.description,
          category: item.category,
          material: item.material,
          value: item.value,
          weight: item.weight || 1,
          stock: 0
        });
      }

      // Actualizar stock
      good.stock += item.quantity;
      await good.save();

      // Añadir item a la transacción
      transactionItems.push({
        goodId: good._id as Types.ObjectId,
        goodName: good.name,
        quantity: item.quantity,
        unitPrice: good.value
      });

      totalAmount += good.value * item.quantity;
    }

    // Crear y guardar transacción
    const transaction = new Transaction({
      transactionType: 'purchase',
      personId: merchant._id,
      personType: 'Merchant',
      personName: merchant.name,
      items: transactionItems,
      totalAmount: totalAmount
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Busca transacciones por persona (nombre del cazador o mercader)
   */
  async findTransactionsByPersonName(personName: string) {
    return await Transaction.find({ personName });
  }

  /**
   * Busca transacciones por fechas y tipo
   */
  async findTransactionsByDateAndType(startDate: Date, endDate: Date, transactionType?: 'purchase' | 'sale') {
    const query: any = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (transactionType) {
      query.transactionType = transactionType;
    }

    return await Transaction.find(query);
  }

  /**
   * Busca una transacción por ID
   */
  async findTransactionById(id: string) {
    return await Transaction.findById(id);
  }

  /**
   * Actualiza una transacción por ID y ajusta stock
   */
  async updateTransactionById(id: string, updateData: Partial<TransactionDocumentInterface>) {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    // Si estamos actualizando los items, necesitamos ajustar el stock
    if (updateData.items) {
      // Deshacer el efecto de los items originales
      await this.revertStockChanges(transaction);
      
      // Aplicar el efecto de los nuevos items
      for (const item of updateData.items) {
        const good = await Good.findById(item.goodId);
        if (!good) {
          throw new Error(`Good with ID ${item.goodId} not found`);
        }
  
        const stockAdjustment = transaction.transactionType === 'sale' ? -item.quantity : item.quantity;
        
        if (transaction.transactionType === 'sale' && good.stock < item.quantity) {
          throw new Error(`Not enough stock for ${good.name}`);
        }

        good.stock += stockAdjustment;
        await good.save();
      }
    }

    // Actualizar la transacción
    return await Transaction.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Elimina una transacción por ID y ajusta stock
   */
  async deleteTransactionById(id: string) {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    // Revertir cambios de stock
    await this.revertStockChanges(transaction);

    // Eliminar la transacción
    return await Transaction.findByIdAndDelete(id);
  }

  /**
   * Revierte los cambios de stock causados por una transacción
   */
  private async revertStockChanges(transaction: TransactionDocumentInterface) {
    for (const item of transaction.items) {
      const good = await Good.findById(item.goodId);
      if (!good) {
        throw new Error(`Good with ID ${item.goodId} not found`);
      }

      // Si era una venta, sumamos al stock; si era una compra, restamos del stock
      const stockAdjustment = transaction.transactionType === 'sale' ? item.quantity : -item.quantity;
      
      // Verificar que hay suficiente stock si estamos devolviendo una compra
      if (transaction.transactionType === 'purchase' && good.stock < item.quantity) {
        throw new Error(`Cannot revert transaction: not enough stock for ${good.name}`);
      }

      good.stock += stockAdjustment;
      await good.save();
    }
  }
}