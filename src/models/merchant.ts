import { Schema, model, Document } from 'mongoose';

/**
 * Interfaz que define la estructura del documento de mercader
 */
export interface MerchantDocumentInterface extends Document {
  name: string,
  type: 'Blacksmith' | 'Alchemist' | 'Armorer' | 'Herbalist' | 'General Goods' | 'Weapons' | 'Other',
  location: string,
}

/**
 * Esquema de Mongoose para mercaderes
 */
const MerchantSchema = new Schema<MerchantDocumentInterface>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del mercader es obligatorio'],
      trim: true,
      unique: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres']
    },
    type: {
      type: String,
      required: [true, 'La especialidad del mercader es obligatoria'],
      enum: {
        values: ['Blacksmith', 'Alchemist', 'Armorer', 'Herbalist', 'General Goods', 'Weapons', 'Other'],
        message: 'La especialidad debe ser válida'
      },
      default: 'General Goods'
    },
    location: {
      type: String,
      trim: true,
      required: [true, 'El origen del mercader es obligatorio'],
      minlength: [2, 'El origen debe tener al menos 2 caracteres']
    }
  }
);

export const Merchant = model<MerchantDocumentInterface>('Merchant', MerchantSchema);