/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test } from "vitest";
import { Good } from "../../src/goods.js";

const good1 = new Good(1, "Pocion de Golondrina", "Pocion de Brujo", "Murcielago", 0.1, 100);
const good2 = new Good(2, "Colonia de Lirio y Grosellas", "Una colonia muy especial", "Lirios y grosellas", 0.7, 60);

describe("Pruebas de Goods", () => {
  test("Prueba básica de inicialización", () => {
    expect(good1.id).toBe(1);
    expect(good1.name).toBe("Pocion de Golondrina");
    expect(good1.description).toBe("Pocion de Brujo");
    expect(good1.material).toBe("Murcielago");
    expect(good1.weight).toBe(0.1);
    expect(good1.value).toBe(100);
  });
  test("Prueba básica de inicialización 2", () => {
    expect(good2.id).toBe(2);
    expect(good2.name).toBe("Colonia de Lirio y Grosellas");
    expect(good2.description).toBe("Una colonia muy especial");
    expect(good2.material).toBe("Lirios y grosellas");
    expect(good2.weight).toBe(0.7);
    expect(good2.value).toBe(60);
  });
  test("Pruebas de Setter", () => {
    expect(good1.id).toBe(1);
    expect(good1.name).toBe("Pocion de Golondrina");
    expect(good1.description).toBe("Pocion de Brujo");
    expect(good1.material).toBe("Murcielago");
    expect(good1.weight).toBe(0.1);
    expect(good1.value).toBe(100);
    good1.setId(3);
    good1.setName("Colonia de Lobo Blanco");
    good1.setDescription("Una colonia rara");
    good1.setMaterial("Aceite de Lobo");
    good1.setWeight(0.7);
    good1.setValue(30);
    expect(good1.id).toBe(3);
    expect(good1.name).toBe("Colonia de Lobo Blanco");
    expect(good1.description).toBe("Una colonia rara");
    expect(good1.material).toBe("Aceite de Lobo");
    expect(good1.weight).toBe(0.7);
    expect(good1.value).toBe(30);
  });
});