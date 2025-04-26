import { Customer } from './customer.js';

export class CustomerManager {
  private _customers: Customer[] = [];

  get customers() { return this._customers; };

  /**
   * Método que añade un cliente a nuestro sistema
   * @param customer - (Customer)
   */
  addCustomer(customer: Customer): void {
    this._customers.push(customer);
  }

  /**
   * Elimina un cliente con un id específico
   * @param customersId - (number)
   */
  removeCustomer(customersId: number): void {
    this._customers = this._customers.filter(customer => customer.id !== customersId);
  }

  updateCustomer( id: number,name?: string, race?: string, location?: string ) {
    const customer = this._customers.find(c => c.id === id);
    if (customer) {
      if (name !== undefined) customer.name = name;
      if (race !== undefined) customer.race = race;
      if (location !== undefined) customer.location = location;
    }
  }

  /**
   * Método que nos permite encontrar a un cliente 
   * dentro de nuestro sistema mediante su nombre
   * @param name - (string)
   * @returns - (Customer | undefined)
   */
  findCustomerByName(name: string): Customer | undefined {
    return this._customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Método que nos permite encontrar a un cliente 
   * dentro de nuestro sistema mediante su raza
   * @param race - raza que vamos a buscar
   * @returns - (Customer[])
   * @example
   * findCustomerByRace('human');
   * // returns [Customer, Customer, Customer]
   */
  findCustomerByRace(race: string): Customer[] {
    return this._customers.filter((customer) => 
      customer.getRace.toLowerCase === race.toLowerCase);
  }

  /** 
   * Método que nos permite encontrar a un cliente
   * dentro de nuestro sistema mediante su ubicación
   * @param location - ubicación que vamos a buscar
   * @returns - (Customer[])
   * @example
   * findCustomerByLocation('Dalaran');
   * // returns [Customer, Customer, Customer]
  */
  findCustomerByLocation(location: string): Customer[] {
    return this._customers.filter((customer) => 
      customer.getLocation.toLowerCase === location.toLowerCase);
  }
}