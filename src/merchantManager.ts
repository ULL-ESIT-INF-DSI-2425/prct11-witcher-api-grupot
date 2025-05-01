import { Merchant } from './merchant.js';


export class MerchantManager {
  async addMerchant(name: string, type: string, location: string) {
    const merchant = new Merchant({ name, type, location });
    await merchant.save();
    return merchant;
  }

  async findByIdAndUpdate(id: string, updateData: { name?: string; type?: string; location?: string }) {
    return await Merchant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async removeMerchantById(id: string) {
    return await Merchant.findByIdAndDelete(id);
  }


  async removeMerchantByName(name: string) {
    return await Merchant.findOneAndDelete({ name });
  }


  async updateMerchantById(id: string, updateData: { name?: string; type?: string; location?: string }) {
    return await Merchant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
   }


  async updateMerchantByName(name: string, updateData: { name?: string; type?: string; location?: string }) {
    return await Merchant.findOneAndUpdate({ name }, updateData, {
      new: true,
      runValidators: true,
    });
  }


  async findMerchantById(id: string) {
    return await Merchant.findById(id);
  }


  async findMerchantByName(name: string) {
    return await Merchant.findOne({ name });
  }
}