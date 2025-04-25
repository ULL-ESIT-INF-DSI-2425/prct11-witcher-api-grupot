/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test } from "vitest";
import { Customer } from '../../src/customer.js';

const customer1 = new Customer(1, "Geralt", "Brujo", "Rivia");
const customer2 = new Customer(2, "Doni", "Enano", "Novigrado");

describe("Pruebas de Customer", () => {
  test("Prueba básica de inicialización", () => {
    expect(customer1.id).toBe(1);
    expect(customer1.name).toBe("Geralt");
    expect(customer1.race).toBe("Brujo");
    expect(customer1.location).toBe("Rivia");
  });
  test("Prueba básica de inicialización 2", () => {
    expect(customer2.id).toBe(2);
    expect(customer2.name).toBe("Doni");
    expect(customer2.race).toBe("Enano");
    expect(customer2.location).toBe("Novigrado");
  });
  test("Pruebas de Setter", () => {
    expect(customer1.id).toBe(1);
    expect(customer1.name).toBe("Geralt");
    expect(customer1.race).toBe("Brujo");
    expect(customer1.location).toBe("Rivia");
    customer1.setId(3);
    customer1.setName("Gerardo");
    customer1.setRace("Humano");
    customer1.setLocation("Velen");
    expect(customer1.id).toBe(3);
    expect(customer1.name).toBe("Gerardo");
    expect(customer1.race).toBe("Humano");
    expect(customer1.location).toBe("Velen");
  });
});