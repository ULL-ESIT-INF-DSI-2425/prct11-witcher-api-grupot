/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test } from "vitest";
import { Transaction } from '../../src/transaction.js';
import { TransactionManager } from '../../src/transaction_manager.js';
import { Good } from "../../src/goods.js";
import { Merchant } from "../../src/mercants.js";

const transactionManager = new TransactionManager();
const good1 = new Good(1, "Pocion de Golondrina", "Pocion de Brujo", "Murcielago", 0.1, 100);
const good2 = new Good(2, "Colonia de Lirio y Grosellas", "Una colonia muy especial", "Lirios y grosellas", 0.7, 60);
const merchant1 = new Merchant(1, "Segredus de Continente", "General", "Velen");
const merchant2 = new Merchant(2, "Iker de Rivia", "Herrero", "Rivia");
const transaction1 = new Transaction(1, new Date(2025, 1, 2), merchant1, [good1], 2, "Compra");
const transaction2 = new Transaction(2, new Date(2025, 3, 1), merchant2, [good1, good2], 10, "Venta");

describe("Pruebas de Merchant", () => {
  test("Prueba básica de inicialización", () => {
    transactionManager.addTransaction(transaction1);
    transactionManager.addTransaction(transaction2);
    expect(transactionManager.getTransactions).toHaveLength(2);
    expect(transactionManager.getTransactions).toContain(transaction1);
    expect(transactionManager.getTransactions).toContain(transaction2);
  });
  test("Pruebas de List Transaction", () => {
    expect(transactionManager.listTransactions()).toContain(transaction1);
    expect(transactionManager.listTransactions()).toContain(transaction2);
  });
});
