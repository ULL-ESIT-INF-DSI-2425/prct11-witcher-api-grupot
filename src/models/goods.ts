import { Schema, model, Document } from "mongoose";
//import { UserDocumentInterface } from "./users.js";

/**
 * Interfaz que define la estructura del documento de bien
 */
export interface GoodDocumentInterface extends Document {
  name: string;
  description: string;
  category:
    | "Weapon"
    | "Armor"
    | "Potion"
    | "Ingredient"
    | "Tool"
    | "Food"
    | "Valuable"
    | "Other";
  material: string;
  value: number;
  stock: number;
  weight: number;
  //owner: UserDocumentInterface;
}

/**
 * Esquema de Mongoose para bienes
 */
const GoodSchema = new Schema<GoodDocumentInterface>({
  name: {
    type: String,
    required: [true, "El nombre del bien es obligatorio"],
    trim: true,
    unique: true,
    minlength: [2, "El nombre debe tener al menos 2 caracteres"],
  },
  description: {
    type: String,
    trim: true,
    required: [true, "La descripción del bien es obligatoria"],
    minlength: [5, "La descripción debe tener al menos 5 caracteres"],
  },
  category: {
    type: String,
    required: [true, "La categoría del bien es obligatoria"],
    enum: {
      values: [
        "Weapon",
        "Armor",
        "Potion",
        "Ingredient",
        "Tool",
        "Food",
        "Valuable",
        "Other",
      ],
      message: "La categoría debe ser válida",
    },
    default: "Other",
  },
  material: {
    type: String,
    required: [true, "La descripción del bien es obligatoria"],
  },
  value: {
    type: Number,
    required: [true, "El valor del item es obligatorio"],
    min: [0, "El valor del item no puede ser negativo"],
  },
  stock: {
    type: Number,
    required: [true, "El stock es obligatorio"],
    min: [0, "El stock no puede ser negativo"],
    default: 0,
  },
  weight: {
    type: Number,
    min: [0, "El peso no puede ser negativo"],
    default: 1,
  }
  // owner: {
  //   type: Schema.Types.ObjectId,
  //   required: true,
  //   ref: "User",
  // },
});

export const Good = model<GoodDocumentInterface>("Good", GoodSchema);
