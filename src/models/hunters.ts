import { Schema, model, Document } from 'mongoose';

/**
 * Interfaz que define la estructura del documento
 */
export interface HunterDocumentInterface extends Document {
  name: string,
  race: 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Goblin' | 'Vampire' | 'Werewolf' | 'Demon' | 'Undead',
  location: string,
}

/**
 * Esquema de Mongoose usando la interfaz
 */
const HunterSchema = new Schema<HunterDocumentInterface>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true, 
    minlength: [1, 'Name must be at least 1 character'],
  },
  race: {
    type: String,
    required: [true, 'Race is required'],
    enum: {
      values: ['Human', 'Elf', 'Dwarf', 'Orc', 'Goblin', 'Vampire', 'Werewolf', 'Demon', 'Undead'],
      message: 'Race must be a valid race',
    },
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    minlength: [2, 'Location must be at least 2 characters'],
    trim: true,
  }
});

/**
 * Modelo Mongoose
 */
export const Hunter = model<HunterDocumentInterface>('Hunter', HunterSchema);
