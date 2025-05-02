import { Hunter } from '../models/hunters.js'; 

export class CustomerManager {

  async addCustomer(name: string, race: string, location: string) {
    const hunter = new Hunter({ name, race, location });
    await hunter.save();
    return hunter;
  }

  async removeCustomerById(id: string) {
    return await Hunter.findByIdAndDelete(id);
  }

  async removeCustomerByName(name: string) {
    return await Hunter.findOneAndDelete({ name });
  }

  async updateCustomerById(id: string, updateData: { name?: string, race?: string, location?: string }) {
    return await Hunter.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateCustomerByName(name: string, updateData: { name?: string, race?: string, location?: string }) {
    return await Hunter.findOneAndUpdate({ name }, updateData, { new: true });
  }

  async findCustomerById(id: string) {
    return await Hunter.findById(id);
  }

  async findCustomerByName(name: string) {
    return await Hunter.findOne({ name });
  }
}
