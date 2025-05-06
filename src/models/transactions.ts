import { Schema, model, Document, Types } from 'mongoose';
//import { UserDocumentInterface } from './users.js';

/**
 * Interfaz para items en transacciones
 */
export interface TransactionItemInterface {
  goodId: Types.ObjectId;
  goodName: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Interfaz que define la estructura del documento de transacción
*/
export interface TransactionDocumentInterface extends Document {
  transactionType: 'purchase' | 'sale';
  personId: Types.ObjectId;
  personType: 'Hunter' | 'Merchant';
  personName: string;
  items: TransactionItemInterface[];
  totalAmount: number;
  //owner: UserDocumentInterface;
}

/**
 * Esquema para items en transacciones
 */
const TransactionItemSchema = new Schema<TransactionItemInterface>({
  goodId: {
    type: Schema.Types.ObjectId,
    ref: 'Good',
    required: [true, 'El ID del bien es obligatorio']
  },
  goodName: {
    type: String,
    required: [true, 'El nombre del bien es obligatorio']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad mínima es 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'El precio por unidad es obligatorio'],
    min: [0, 'El precio por unidad no puede ser negativo']
  }
});

/**
 * Esquema de Mongoose para transacciones
*/
const TransactionSchema = new Schema<TransactionDocumentInterface>(
  {
    transactionType: {
      type: String,
      enum: {
        values: ['purchase', 'sale'], // purchase: compra a mercader, sale: venta a cazador
        message: 'El tipo de transacción debe ser válido'
      },
      required: [true, 'El tipo de transacción es obligatorio']
    },
    personId: {
      type: Schema.Types.ObjectId,
      required: [true, 'El ID de la persona es obligatorio'],
      refPath: 'personType'
    },
    personType: {
      type: String,
      enum: {
        values: ['Hunter', 'Merchant'],
        message: 'El tipo de persona debe ser válido'
      },
      required: [true, 'El tipo de persona es obligatorio']
    },
    personName: {
      type: String,
      required: [true, 'El nombre de la persona es obligatorio']
    },
    items: {
      type: [TransactionItemSchema],
      validate: [
        {
          validator: function(items: TransactionItemInterface[]) {
            return items.length > 0;
          },
          message: 'La transacción debe incluir al menos un ítem'
        }
      ]
    },
    totalAmount: {
      type: Number,
      required: [true, 'El importe total es obligatorio'],
      min: [0, 'El importe total no puede ser negativo']
    }
    // owner: {
    //   type: Schema.Types.ObjectId,
    //   required: true,
    //   ref: 'User'
    // }
  }
);

// Pre-save hook para calcular el importe total si no se proporciona
TransactionSchema.pre('save', function(next) {
  if (!this.totalAmount) {
    this.totalAmount = this.items.reduce(
      (total, item) => total + item.quantity * item.unitPrice, 
      0
    );
  }
  next();
});

export const Transaction = model<TransactionDocumentInterface>('Transaction', TransactionSchema);