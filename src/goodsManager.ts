/* eslint-disable @typescript-eslint/no-explicit-any */
import { Good, GoodDocumentInterface } from './goods.js';

export class GoodManager {

  async addGood(goodData: {
    name: string;
    description: string;
    category: 'Weapon' | 'Armor' | 'Potion' | 'Ingredient' | 'Tool' | 'Food' | 'Valuable' | 'Other';
    material: string;
    value: number;
    stock: number;
    weight: number;
  }) {
    const good = new Good(goodData);
    await good.save();
    return good;
  }

  async removeGoodById(id: string) {
    return await Good.findByIdAndDelete(id);
  }

  async removeGoodByName(name: string) {
    return await Good.findOneAndDelete({ name });
  }

  async updateGoodById(id: string, updateData: Partial<GoodDocumentInterface>) {
    return await Good.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateGoodByName(name: string, updateData: Partial<GoodDocumentInterface>) {
    return await Good.findOneAndUpdate({ name }, updateData, { new: true });
  }

  async findGoodById(id: string) {
    return await Good.findById(id);
  }

  async findGoodByName(name: string) {
    return await Good.findOne({ name });
  }

  async findGoodsByQuery(query: any) {
    return await Good.find(query);
  }

  async updateStock(goodId: string, quantity: number) {
    const good = await Good.findById(goodId);
    if (!good) {
      throw new Error(`Good with ID ${goodId} not found`);
    }
    
    if (good.stock + quantity < 0) {
      throw new Error(`Not enough stock for item ${good.name}`);
    }
    
    good.stock += quantity;
    await good.save();
    return good;
  }
}