import { Transaction, TransactionItemInterface } from '../models/transactions.js';
import { Good } from '../models/goods.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchant.js';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

/**
 * Interfaz para el cuerpo de la petición de creación de transacción
 */
interface CreateTransactionRequestBody {
  transactionType: 'purchase' | 'sale';
  personName: string;
  items: {
    goodName: string;
    quantity: number;
  }[];
}

/**
 * Crear una nueva transacción
 */
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionType, personName, items } = req.body as CreateTransactionRequestBody;
    if (!transactionType || !personName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos incompletos o inválidos'
      });
    }
    let person;
    if (transactionType === 'purchase') {
      person = await Hunter.findOne({ name: personName });
    } else {
      person = await Merchant.findOne({ name: personName });
    }
    if (!person) {
      return res.status(404).json({
        success: false,
        message: `${personName} no encontrado`
      });
    }
    const personType = person instanceof Hunter ? 'Hunter' : 'Merchant';
    const transactionItems: TransactionItemInterface[] = [];
    let totalAmount = 0;
    // Si es una compra (hunter compra a la posada)
    if (transactionType === 'purchase') {
      // Verificar que existen todos los bienes y hay stock suficiente
      for (const item of items) {
        const good = await Good.findOne({ name: item.goodName });
        if (!good) {
          return res.status(404).json({
            success: false,
            message: `Bien ${item.goodName} no encontrado`
          });
        }
        if (good.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para ${item.goodName}. Disponible: ${good.stock}, Solicitado: ${item.quantity}`
          });
        }
        // Actualizar el stock del bien
        good.stock -= item.quantity;
        await good.save();
        // Añadir ítem a la transacción - usando value como precio
        transactionItems.push({
          goodId: good._id as Types.ObjectId,
          goodName: good.name,
          quantity: item.quantity,
          unitPrice: good.value
        });
        totalAmount += item.quantity * good.value;
      }
    } else { // Si es una venta (merchant vende a la posada)
      for (const item of items) {
        // Buscar si el bien ya existe
        let good = await Good.findOne({ name: item.goodName })
        if (good) {
          // Si el bien existe, actualizar su stock
          good.stock += item.quantity;
          await good.save();
        } else {
          // Si el bien no existe, se crea
          good = new Good({
            name: item.goodName,
            description: `Suministrado por ${personName}`,
            category: 'Other', // Categoría por defecto
            material: 'Común',
            value: 100, // Valor por defecto
            stock: item.quantity,
            weight: 1 // Peso por defecto
          });
          await good.save();
        }
        // Añadir ítem a la transacción - usamos un precio de compra ligeramente menor al valor del bien
        const buyPrice = good.value * 0.7; // Compramos a un 70% del valor de venta
        transactionItems.push({
          goodId: good._id as Types.ObjectId,
          goodName: good.name,
          quantity: item.quantity,
          unitPrice: buyPrice
        });
        totalAmount += item.quantity * buyPrice;
      }
    }
    // Crear la transacción 
    const newTransaction = new Transaction({
      transactionType,
      personId: person._id,
      personType,
      personName,
      items: transactionItems,
      totalAmount,
      date: new Date()
    });
    await newTransaction.save();
    return res.status(201).json({
      success: true,
      data: newTransaction
    });
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la transacción',
      error: (error as Error).message
    });
  }
};

/**
 * Obtener transacciones según filtros
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { personName, startDate, endDate, transactionType } = req.query;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (personName) {
      query.personName = personName;
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string), // $gte -> greater than or equal to
        $lte: new Date(endDate as string) // $lte -> less than or equal to
      };
    }
    if (transactionType && ['purchase', 'sale', 'all'].includes(transactionType as string)) {
      if (transactionType !== 'all') {
        query.transactionType = transactionType;
      }
    }
    const transactions = await Transaction.find(query)
      .sort({ date: -1 }) 
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones',
      error: (error as Error).message
    });
  }
};

/**
 * Obtener una transacción por su ID
 */
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }
    return res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener transacción',
      error: (error as Error).message
    });
  }
};

/**
 * Actualizar una transacción por su ID
 */
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const originalTransaction = await Transaction.findById(req.params.id);
    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }
    // Restaurar el stock original (revertir la transacción)
    if (originalTransaction.transactionType === 'purchase') {
      // Si era una compra, devolver los productos al inventario
      for (const item of originalTransaction.items) {
        const good = await Good.findById(item.goodId);
        if (good) {
          good.stock += item.quantity;
          await good.save();
        }
      }
    } else {
      // Si era una venta, quitar los productos del inventario
      for (const item of originalTransaction.items) {
        const good = await Good.findById(item.goodId);
        if (good) {
          good.stock -= item.quantity;
          // Verificar que no quede stock negativo
          if (good.stock < 0) {
            return res.status(400).json({
              success: false,
              message: `No se puede actualizar. Stock insuficiente para ${good.name}`
            });
          }
          await good.save();
        }
      }
    }

    // Si llegamos a este punto, crear una nueva transacción con los datos actualizados
    const updatedData = {
      ...req.body,
      // No permitimos cambiar ciertos campos
      transactionType: originalTransaction.transactionType,
      personId: originalTransaction.personId,
      personType: originalTransaction.personType,
    };
    // Actualizar la transacción
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { 
        new: true,
        runValidators: true,
      }
    );
    return res.status(200).json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar transacción',
      error: (error as Error).message
    });
  }
};

/**
 * Eliminar una transacción por su ID
 */
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }
    if (transaction.transactionType === 'purchase') {
      // Si era una compra de un cazador, devolver los bienes al inventario
      for (const item of transaction.items) {
        const good = await Good.findById(item.goodId);
        if (good) {
          good.stock += item.quantity;
          await good.save();
        }
      }
    } else {
      // Si era una venta de un mercader, quitar los bienes del inventario
      for (const item of transaction.items) {
        const good = await Good.findById(item.goodId);
        if (good) {
          good.stock -= item.quantity;
          // Verificar que no quede stock negativo
          if (good.stock < 0) {
            return res.status(400).json({
              success: false,
              message: `No se puede eliminar. Stock insuficiente para ${good.name}`
            });
          }
          await good.save();
        }
      }
    }
    // Eliminar la transacción
    await Transaction.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Transacción eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar transacción',
      error: (error as Error).message
    });
  }
};