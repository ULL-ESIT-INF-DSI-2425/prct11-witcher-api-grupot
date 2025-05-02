import { Document, Schema, model } from 'mongoose';
import validator from 'validator';

export interface UserDocumentInterface extends Document {
  name: string;
  username: string;
  age?: number;
}

const UserSchema = new Schema<UserDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
    if (!validator.default.isAlphanumeric(value)) {
        throw new Error('El nombre del usuario sólo puede contener caracteres alfanuméricos');
      }
    },
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    default: 0,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error('Age must be greater than 0');
      }
    }
  },
});

export const User = model<UserDocumentInterface>('User', UserSchema);