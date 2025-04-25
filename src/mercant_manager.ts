import { Merchant } from './mercants.js';

export class MerchantManager {
  private _merchants: Merchant[] = [];

  get merchants() { return this._merchants; };

  /**
   * Método que añade un mercader a nuestro sistema
   * @param merchant - (Merchant) 
   */
  addMerchant(merchant: Merchant) {
    this._merchants.push(merchant);
  }
    
  /**
   * Elimina un mercader con un id específico
   * @param merchantId - (number)
   */
  removeMerchant(merchantId: number): void {
    this._merchants = this._merchants.filter(merchant => merchant.id !== merchantId);
  }

  /**
   * Actualiza un mercader existente.
   * @param id - (number) ID del mercader a modificar.
   * @param name - (string?) nuevo nombre.
   * @param type - (string?) nuevo tipo.
   * @param location - (string?) nueva ubicación.
   */
  updateMerchant(id: number, name?: string, type?: string, location?: string) {
    const merchant = this._merchants.find(m => m.id === id);
    if (merchant) {
      if (name !== undefined) merchant.name = name;
      if (type !== undefined) merchant.type = type;
      if (location !== undefined) merchant.location = location;
    }
  }


  /**
   * Método para localizar mercader a través de su tipo
   * @param type - (string) tipo de mercader
   * @returns - (Merchant[])
   * @example
   * findMerchantByType('food');
   * // returns [Merchant, Merchant, Merchant]
   */
  findMerchantByType(type: string) {
    return this.merchants.filter((merchant) => merchant.getType === type);
  }

  /**
   * Método para localizar mercader a través de su location
   * @param location - (string) ubicación del mercader
   * @returns - (Merchant[])
   * @example
   * findMerchantByLocation('Dalaran');
   * // returns [Merchant, Merchant, Merchant]
   */
  findMerchantByLocation(location: string) {
    return this.merchants.filter((merchant) => merchant.getLocation === location);
  }

  /**
   * Método para localizar mercader a través de su name
   * @param name - (string) nombre del mercader
   * @returns - (Merchant[])
   * @example
   * findMerchantByName('Jaina');
   * // returns [Merchant]
   */
  findMerchantByName(name: string) {
    return this.merchants.filter((merchant) => merchant.getName === name);
  }
}