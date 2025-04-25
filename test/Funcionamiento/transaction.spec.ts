/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test } from "vitest";
import { Transaction } from "../../src/transaction.js";
import { Merchant } from "../../src/mercants.js";
import { Good } from "../../src/goods.js";

const good1 = new Good(1, "Pocion de Golondrina", "Pocion de Brujo", "Murcielago", 0.1, 100);
const good2 = new Good(2, "Colonia de Lirio y Grosellas", "Una colonia muy especial", "Lirios y grosellas", 0.7, 60);
const merchant1 = new Merchant(1, "Segredus de Continente", "General", "Velen");
const merchant2 = new Merchant(2, "Iker de Rivia", "Herrero", "Rivia");
const transaction1 = new Transaction(1, new Date(2025, 1, 2), merchant1, [good1], 100, "Compra");
const transaction2 = new Transaction(2, new Date(2025, 3, 1), merchant2, [good1, good2], 160, "Venta");

describe("Pruebas de Transaction", () => {
  test("Prueba básica de inicialización", () => {
    expect(transaction1.id).toBe(1);
    expect(transaction1.date).toStrictEqual(new Date(2025, 1, 2));
    expect(transaction1.buyerOrSeller).toBe(merchant1);
    expect(transaction1.goods).toStrictEqual([good1]);
    expect(transaction1.totalAmount).toBe(100);
    expect(transaction1.type).toBe("Compra");
  });
  test("Prueba básica de inicialización 2", () => {
    expect(transaction2.id).toBe(2);
    expect(transaction2.date).toStrictEqual(new Date(2025, 3, 1));
    expect(transaction2.buyerOrSeller).toBe(merchant2);
    expect(transaction2.goods).toStrictEqual([good1, good2]);
    expect(transaction2.totalAmount).toBe(160);
    expect(transaction2.type).toBe("Venta");
  });
  test("Pruebas de Setter", () => {
    expect(transaction1.id).toBe(1);
    expect(transaction1.date).toStrictEqual(new Date(2025, 1, 2));
    expect(transaction1.buyerOrSeller).toBe(merchant1);
    expect(transaction1.goods).toStrictEqual([good1]);
    expect(transaction1.totalAmount).toBe(100);
    expect(transaction1.type).toBe("Compra");
    transaction1.setId(3);
    transaction1.setDate(new Date(2025, 2, 5));
    transaction1.setBuyerSeller(merchant2);
    transaction1.setGoods([good2, good1]);
    transaction1.setTotalAmount(160);
    transaction1.setType("Venta");
    expect(transaction1.id).toBe(3);
    expect(transaction1.date).toStrictEqual(new Date(2025, 2, 5));
    expect(transaction1.buyerOrSeller).toBe(merchant2);
    expect(transaction1.goods).toStrictEqual([good2, good1]);
    expect(transaction1.totalAmount).toBe(160);
    expect(transaction1.type).toBe("Venta");
  });

  test("Pruebas para los getters", () => {
    expect(transaction1.getId).toBe(3)
    expect(transaction1.getDate).toStrictEqual(new Date(2025, 2, 5));
    expect(transaction1.getBuyerSeller).toBe(merchant2);
    expect(transaction1.getGoods).toEqual([good2, good1]);
    expect(transaction1.getType).toBe("Venta");
  });

  test("Agregar un bien correctamente", () => {
    transaction1.addGood(good2);
    expect(transaction1.getGoods).toContain(good2);
    expect(transaction1.getTotalAmount).toBe(220);
  });


  test("Eliminar un bien correctamente", () => {
    transaction2.removeGood(2);
    expect(transaction2.getGoods).not.toContain(good2);
    expect(transaction2.getTotalAmount).toBe(100);
  });


  test("Validar correctamente si la transacción es válida", () => {
    expect(transaction1.isValid()).toBe(true);
    transaction1.removeGood(1);
    transaction1.removeGood(2);
    expect(transaction1.isValid()).toBe(false); // Ahora está vacía, debe ser inválida
  });


  test("Generar correctamente un resumen de la transacción", () => {
    const summary = transaction2.getSummary();
    expect(summary).toContain("ID: 2");
    expect(summary).toContain("Fecha: 01/04/2025");
    expect(summary).toContain("Tipo: Venta");
    expect(summary).toContain("Total: 100 monedas");
    expect(summary).toContain("Número de bienes: 1");
  });
});

