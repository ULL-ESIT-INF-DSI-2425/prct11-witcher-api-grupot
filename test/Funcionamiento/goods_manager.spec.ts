/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, test, vi, afterEach} from "vitest";
import { GoodsManager } from '../../src/goodsManager.js';
import { Good } from "../../src/goods.js";
//import exp from "constants";

const good1 = new Good(1, "Pocion de Golondrina", "Pocion de Brujo", "Murcielago", 0.1, 100);
const good2 = new Good(2, "Colonia de Lirio y Grosellas", "Una colonia muy especial", "Lirios y grosellas", 0.7, 60);
// Se modifica el good3
const good3 = new Good(3, "Colonia de Lirio y Grosellas", "Una colonia muy especial", "Lirios y grosellas", 0.7, 60);

describe("listItems", () => {
  test("Funcionamiento normal", () => {
    let white_wolf_inn_inventory = new GoodsManager();
    white_wolf_inn_inventory.addItem(good1);
    white_wolf_inn_inventory.addItem(good2);
    expect(white_wolf_inn_inventory.listItems("name", true)).toStrictEqual([good2, good1]);
  });
});

describe("addItem", () => {
  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  test("Funcionamiento normal", () => {
    let my_system = new GoodsManager();
    const spy = vi.spyOn(my_system, "addItem");
    expect(my_system.items).toHaveLength(0);
    my_system.addItem(good2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(my_system.items).toHaveLength(1);
    expect(my_system.items).toContain(good2);
  });
});

describe("removeItem", () => {
  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  test("Funcionamiento normal", () => {
    let my_system = new GoodsManager();
    my_system.addItem(good2);
    expect(my_system.items).toHaveLength(1);
    const spy = vi.spyOn(my_system, "removeItem");
    my_system.removeItem(2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(my_system.items).toHaveLength(0);
  });
});

describe("Consultar información de bienes especificos", () => {
  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  test("Funcionamiento normal", () => {
    let my_system = new GoodsManager();
    my_system.addItem(good1);
    my_system.addItem(good2);
    const good = my_system.items.find(item => item.id === 1);
    expect(good).toStrictEqual(good1);
  });
});

describe("Métodos de búsqueda", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("findItemByID", () => {
    let my_system = new GoodsManager();
    my_system.addItem(good1);
    my_system.addItem(good2);
    expect(my_system.findItemById(1)).toStrictEqual(good1);
    expect(my_system.findItemById(2)).toStrictEqual(good2);
    expect(my_system.findItemById(3)).toBeUndefined();
  });
  test("findItemByName", () => {
    let my_system = new GoodsManager();
    my_system.addItem(good1);
    my_system.addItem(good2);
    expect(my_system.findItemByName("Pocion de Golondrina")).toStrictEqual([good1]);
    expect(my_system.findItemByName("Colonia de Lirio y Grosellas")).toStrictEqual([good2]);
    expect(my_system.findItemByName("Colonia vacia")).toStrictEqual([]);
  });
  test("findItemByMaterial", () => {
    let my_system = new GoodsManager();
    my_system.addItem(good1);
    my_system.addItem(good2);
    expect(my_system.findItemByMaterial("Murcielago")).toStrictEqual([good1]);
    expect(my_system.findItemByMaterial("Lirios y grosellas")).toStrictEqual([good2]);
    expect(my_system.findItemByMaterial("Lirios")).toStrictEqual([]);
  }
  );
});


describe("Modificar item", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("Funcionamiento normal", () => {
    let my_system = new GoodsManager();
    my_system.addItem(good3);  
    // const good3 = new Good(2, "Colonia de Lirio y Grosellas", "Una colonia muy especial", "Lirios y grosellas", 0.7, 60);
    my_system.updateGood(3, 'Colonia vacia', undefined, undefined, undefined, undefined);
    const good: (Good | undefined) = my_system.items.find(item => item.id === 3);
    expect("getId" in good).toBe(true);
    expect(good.name).toBe('Colonia vacia');
    expect(good.description).toBe('Una colonia muy especial');
    expect(good.material).toBe('Lirios y grosellas');
    expect(good.weight).toBe(0.7);
    expect(good.value).toBe(60);
  });
});





describe("Control automatico => generar una lista de la compra", () => {
  test("Debe devolver una lista vacía cuando el peso total de cada bien es suficiente", () => {
    const manager = new GoodsManager();


    // Agregar bienes con peso total  (≥1kg)
    manager.addItem(new Good(10, "Harina", "Harina de trigo", "Trigo", 0.5, 10));
    manager.addItem(new Good(10, "Harina", "Harina de trigo", "Trigo", 0.6, 10));


    manager.addItem(new Good(20, "Azúcar", "Azúcar blanca", "Caña", 1, 8));


    manager.addItem(new Good(30, "Leche", "Leche entera", "Lácteo", 0.4, 5));
    manager.addItem(new Good(30, "Leche", "Leche entera", "Lácteo", 0.7, 5));


    expect(manager.checkStockShortage()).toEqual([]);
  });


  test("Debe detectar un bien con peso total insuficiente", () => {
    const manager = new GoodsManager();


    // "Leche" tiene 0.9kg  total
    manager.addItem(new Good(10, "Harina", "Harina de trigo", "Trigo", 1.2, 10));
    manager.addItem(new Good(20, "Azúcar", "Azúcar blanca", "Caña", 1, 8));
    manager.addItem(new Good(30, "Leche", "Leche entera", "Lácteo", 0.5, 5));
    manager.addItem(new Good(30, "Leche", "Leche entera", "Lácteo", 0.4, 5));


    const shortage = manager.checkStockShortage();
    expect(shortage.length).toBe(1);
    expect(shortage[0].getName).toBe("Leche");
  });


  test("Debe detectar múltiples bienes con peso insuficiente", () => {
    const manager = new GoodsManager();


    // "Harina" (0.6kg) y "Azúcar" (0.8kg)
    manager.addItem(new Good(10, "Harina", "Harina de trigo", "Trigo", 0.3, 10));
    manager.addItem(new Good(10, "Harina", "Harina de trigo", "Trigo", 0.3, 10));


    manager.addItem(new Good(20, "Azúcar", "Azúcar blanca", "Caña", 0.4, 8));
    manager.addItem(new Good(20, "Azúcar", "Azúcar blanca", "Caña", 0.4, 8));


    manager.addItem(new Good(30, "Leche", "Leche entera", "Lácteo", 1.2, 5));


    const shortage = manager.checkStockShortage();
    expect(shortage.length).toBe(2);
    expect(shortage.find((item) => item.getName === "Harina")).toBeDefined();
    expect(shortage.find((item) => item.getName === "Azúcar")).toBeDefined();
  });


  test("Debe devolver todos los bienes requeridos si el inventario está vacío", () => {
    const manager = new GoodsManager();
    const shortage = manager.checkStockShortage();
    expect(shortage.length).toBe(0);
  });


  test("Debe detectar un umbral menor con pesos personalizados", () => {
    const manager = new GoodsManager();


    // "Harina" (0.9kg) y "Huevos" (0.7kg)
    manager.addItem(new Good(10, "Harina", "Harina de trigo", "Trigo", 0.9, 10));


    manager.addItem(new Good(30, "Leche", "Leche entera", "Lácteo", 1.5, 5));


    manager.addItem(new Good(40, "Huevos", "Huevos frescos", "Huevo", 0.7, 6));


    const shortage = manager.checkStockShortage();
    expect(shortage.length).toBe(2);
    expect(shortage.find((item) => item.getName === "Harina")).toBeDefined();
    expect(shortage.find((item) => item.getName === "Huevos")).toBeDefined();
  });
});


