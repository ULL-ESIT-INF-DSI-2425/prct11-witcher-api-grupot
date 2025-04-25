/* eslint-disable @typescript-eslint/no-unused-vars */
import { afterEach, describe, expect, test, vi } from "vitest";
import { Customer } from '../../src/customer.js';
import { CustomerManager } from '../../src/customer_manager.js';

const customerManager = new CustomerManager();
const customer1 = new Customer(1, "Geralt", "Brujo", "Rivia");
const customer2 = new Customer(2, "Doni", "Enano", "Novigrado");
const customer3 = new Customer(3, "Ignacio", "Humano", "Ciudad C");

describe("Pruebas de Merchant", () => {
  test("Prueba básica de inicialización", () => {
    customerManager.addCustomer(customer1);
    customerManager.addCustomer(customer2);
    expect(customerManager.customers).toHaveLength(2);
    expect(customerManager.customers).toContain(customer1);
    expect(customerManager.customers).toContain(customer2);
  });
  test("Pruebas de remove merchant", () => {
    customerManager.removeCustomer(2);
    expect(customerManager.customers).toHaveLength(1);
    expect(customerManager.customers).toContain(customer1);
    expect(customerManager.customers).not.toContain(customer2);
  });
  test("Pruebas de updateMerchant", () => {
    customerManager.updateCustomer(1, "Geralt", "Brujo", "Novigrado");
    expect(customer1.location).toBe("Novigrado");
  });
  test("Pruebas de findCustomerByName", () => {
    expect(customerManager.findCustomerByName("Geralt")).toBe(customer1);
  });
  test("Pruebas de findMerchantByLocation", () => {
    customerManager.addCustomer(customer2);
    expect(customerManager.findCustomerByLocation("Novigrado")).toContain(customer1);
    expect(customerManager.findCustomerByLocation("Novigrado")).toContain(customer2);
  });
  test("findCustomerByRace", () => {
    expect(customerManager.findCustomerByRace("Brujo")).toContain(customer1);
  });

  describe("Manipulación y visualización de customers", () => {
    afterEach(() => {
      vi.restoreAllMocks(); 
    });
  
    let my_system = new CustomerManager();
    test("Adicion de clientes", () => {
      const spy = vi.spyOn(my_system, "addCustomer");
      my_system.addCustomer(customer1);
      expect(my_system.customers).toHaveLength(1);
      expect(spy).toHaveBeenCalledTimes(1);
      my_system.addCustomer(customer2);
      expect(my_system.customers).toHaveLength(2);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  
    test("Visualización de clientes", () => {
      expect(my_system.findCustomerByName("Doni")).toStrictEqual(customer2);
      expect(my_system.findCustomerByName("geralt")).toStrictEqual(customer1);
    });
  
    test("Eliminación de clientes", () => {
      expect(my_system.customers).toHaveLength(2);
      const spy = vi.spyOn(my_system, "removeCustomer");
      my_system.removeCustomer(1);
      expect(my_system.customers).toHaveLength(1);
      expect(spy).toHaveBeenCalledTimes(1);
      my_system.removeCustomer(2);
      expect(my_system.customers).toHaveLength(0);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  
     test('actualiza solo la ubicación de un cliente sin modificar otros atributos', () => {
        my_system.addCustomer(customer3);
        my_system.updateCustomer(3, undefined, undefined, 'Ciudad D');
        const customer = my_system.customers.find(c => c.id === 3);
        expect(customer).toBeDefined();
        expect(customer.location).toBe('Ciudad D');
        expect(customer.name).toBe('Ignacio');
        expect(customer.race).toBe('Humano');
     });
  });
});
