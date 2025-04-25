/* eslint-disable @typescript-eslint/no-unused-vars */
import { afterEach, describe, expect, expectTypeOf, it, test, vi } from "vitest";
import { Merchant } from '../../src/mercants.js';
import { MerchantManager } from "../../src/mercant_manager.js";

const merchantManager = new MerchantManager();
const merchant1 = new Merchant(1, "Segredus de Continente", "General", "Velen");
const merchant2 = new Merchant(2, "Iker de Rivia", "Herrero", "Rivia");
const merchant3 = new Merchant(3, "Ignacius de Dalaran", "Joyero", "Dalaran");

describe("Pruebas de Merchant", () => {
  test("Prueba básica de inicialización", () => {
    merchantManager.addMerchant(merchant1);
    merchantManager.addMerchant(merchant2);
    expect(merchantManager.merchants).toHaveLength(2);
    expect(merchantManager.merchants).toContain(merchant1);
    expect(merchantManager.merchants).toContain(merchant2);
  });
  test("Pruebas de remove merchant", () => {
    merchantManager.removeMerchant(2);
    expect(merchantManager.merchants).toHaveLength(1);
    expect(merchantManager.merchants).toContain(merchant1);
    expect(merchantManager.merchants).not.toContain(merchant2);
  });
  test("Pruebas de updateMerchant", () => {
    merchantManager.updateMerchant(1, "Segredus de Continente", "General", "Dalaran");
    expect(merchant1.location).toBe("Dalaran");
  });
  test("Pruebas de findMerchantByType", () => {
    expect(merchantManager.findMerchantByType("General")).toContain(merchant1);
  });
  test("Pruebas de findMerchantByLocation", () => {
    expect(merchantManager.findMerchantByLocation("Dalaran")).toContain(merchant1);
  });
  test("Pruebas de Name", () => {
    expect(merchant1.name).toBe("Segredus de Continente");
  });
});

describe("Manipulación y visualización de merchants", () => {
  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  let my_system = new MerchantManager();
  test("Adicion de mercaderes", () => {
    const spy = vi.spyOn(my_system, "addMerchant");
    my_system.addMerchant(merchant1);
    expect(my_system.merchants).toHaveLength(1);
    expect(spy).toHaveBeenCalledTimes(1);
    my_system.addMerchant(merchant2);
    expect(my_system.merchants).toHaveLength(2);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test("Visualización de mercaderes", () => {
    expect(my_system.findMerchantByName("Iker de Rivia")).toStrictEqual([merchant2]);
    expect(my_system.findMerchantByName("Segredus de Continente")).toStrictEqual([merchant1]);
  });

  test("Eliminación de mercaderes", () => {
    expect(my_system.merchants).toHaveLength(2);
    const spy = vi.spyOn(my_system, "removeMerchant");
    my_system.removeMerchant(1);
    expect(my_system.merchants).toHaveLength(1);
    expect(spy).toHaveBeenCalledTimes(1);
    my_system.removeMerchant(2);
    expect(my_system.merchants).toHaveLength(0);
    expect(spy).toHaveBeenCalledTimes(2);
  });
  test('actualiza solo la ubicación de un mercader sin modificar otros atributos', () => {
    my_system.addMerchant(merchant3);
    my_system.updateMerchant(3, undefined, undefined, 'Ciudad C');
   
    const merchant = my_system.merchants.find(m => m.id === 3);
    expect(merchant).toBeDefined();
    expect(merchant.location).toBe('Ciudad C');
    expect(merchant.name).toBe('Ignacius de Dalaran');
    expect(merchant.type).toBe('Joyero');
  });
});

