import { describe, test, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import { GoodsManager } from '../../src/goodsManager.js';
import { Good } from '../../src/goods.js';
import { reportGen } from '../../src/reportGen.js';
import { TransactionManager } from '../../src/transaction_manager.js';
import { Merchant } from '../../src/mercants.js';
import { Customer } from '../../src/customer.js';
import { Transaction } from '../../src/transaction.js';

describe('consultarStock', () => {
  let inventory: GoodsManager;
  let informe: reportGen;

  beforeEach(() => {
    inventory = new GoodsManager();
    inventory.addItem(new Good(1, 'Espada de Fuego', 'Una espada ardiente', 'Hierro', 3.5, 100));
    inventory.addItem(new Good(2, 'Escudo de Hierro', 'Un escudo resistente', 'Hierro', 5.0, 75));
    informe = new reportGen(inventory, new TransactionManager());
  });

  test('debería mostrar un mensaje si el inventario está vacío', async () => {
    inventory = new GoodsManager(); 
    informe = new reportGen(inventory, new TransactionManager());
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarStock();
    expect(consoleSpy).toHaveBeenCalledWith('El inventario está vacío.');
    consoleSpy.mockRestore();
  });

  test('debería mostrar la información del bien seleccionado', async () => {
    const promptSpy = vi.spyOn(inquirer, 'prompt').mockResolvedValue({ itemSeleccionado: 'Espada de Fuego' });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarStock();
    expect(consoleSpy).toHaveBeenCalledWith("\nEstado del stock para 'Espada de Fuego':");
    expect(consoleSpy).toHaveBeenCalledWith("- ID: 1, Material: Hierro, Peso: 3.5, Valor: 100");
    promptSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  test('debería mostrar un mensaje si no hay stock del bien seleccionado', async () => {
    const promptSpy = vi.spyOn(inquirer, 'prompt').mockResolvedValue({ itemSeleccionado: 'Poción de Vida' });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarStock();
    expect(consoleSpy).toHaveBeenCalledWith("No hay stock disponible para 'Poción de Vida'.");
    promptSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});

describe('consultarBienesMasVendidos', () => {
  let inventory: GoodsManager;
  let informe: reportGen;
  let transacciones: TransactionManager;
  const good1 = new Good(1, "Espada de Acero", "Una espada afilada hecha de acero de alta calidad.", "Acero", 2.5, 300);
  const good2 = new Good(2, "Escudo de Madera", "Un escudo resistente hecho de roble.", "Madera", 1.8, 150 );
  const good3 = new Good(3, "Poción de Salud", "Una poción mágica que restaura la salud.", "Vidrio", 0.5, 50 );
  const merchant = new Merchant( 1, "El Mercader Errante", "Comerciante de armas y pociones", "Ciudad de Acero");
  const customer = new Customer( 1, "Aragorn", "Humano", "Rivendell");
  const transaction1 = new Transaction(1, new Date(), customer, [good1, good3], 0, "Compra");
  const transaction2 = new Transaction(2, new Date(), merchant, [good2], 0, "Venta");
  const transaction3 = new Transaction(3, new Date(), customer, [good1], 0, "Devolución");

  beforeEach(() => {
    inventory = new GoodsManager();
    inventory.addItem(new Good(1, 'Espada de Fuego', 'Una espada ardiente', 'Hierro', 3.5, 100));
    inventory.addItem(new Good(2, 'Escudo de Hierro', 'Un escudo resistente', 'Hierro', 5.0, 75));
    transacciones = new TransactionManager();
    transacciones.addTransaction(transaction1);
    transacciones.addTransaction(transaction2);
    transacciones.addTransaction(transaction3);
    informe = new reportGen(inventory, transacciones);
  });

  test('debería mostrar un mensaje si no hay transacciones', async () => {
    inventory = new GoodsManager();
    transacciones = new TransactionManager(); 
    informe = new reportGen(inventory, transacciones);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarBienesMasVendidos();
    expect(consoleSpy).toHaveBeenCalledWith('No hay transacciones registradas.');
    consoleSpy.mockRestore();
  });

  test('debería mostrar la información de los bienes mas vendidos', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarBienesMasVendidos();
    expect(consoleSpy).toHaveBeenCalledWith('\nBienes más vendidos:');
    expect(consoleSpy).toHaveBeenCalledWith("1. Escudo de Madera - Vendido 1 veces");
    consoleSpy.mockRestore();
  });

  test('debería mostrar un mensaje si no ventas', async () => {
    transacciones = new TransactionManager();
    transacciones.addTransaction(transaction1);
    informe = new reportGen(inventory, transacciones);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarBienesMasVendidos();
    expect(consoleSpy).toHaveBeenCalledWith('No se han registrado ventas de bienes.');
    consoleSpy.mockRestore();
  });
});

describe('consultarIngresosYGastos', () => {
  let inventory: GoodsManager;
  let informe: reportGen;
  let transacciones: TransactionManager;
  const good1 = new Good(1, "Espada de Acero", "Una espada afilada hecha de acero de alta calidad.", "Acero", 2.5, 300);
  const good2 = new Good(2, "Escudo de Madera", "Un escudo resistente hecho de roble.", "Madera", 1.8, 150 );
  const good3 = new Good(3, "Poción de Salud", "Una poción mágica que restaura la salud.", "Vidrio", 0.5, 50 );
  const merchant = new Merchant( 1, "El Mercader Errante", "Comerciante de armas y pociones", "Ciudad de Acero");
  const customer = new Customer( 1, "Aragorn", "Humano", "Rivendell");
  const transaction1 = new Transaction(1, new Date(), customer, [good1, good3], 0, "Compra");
  const transaction2 = new Transaction(2, new Date(), merchant, [good2], 0, "Venta");
  const transaction3 = new Transaction(3, new Date(), customer, [good1], 0, "Devolución");

  beforeEach(() => {
    inventory = new GoodsManager();
    inventory.addItem(new Good(1, 'Espada de Fuego', 'Una espada ardiente', 'Hierro', 3.5, 100));
    inventory.addItem(new Good(2, 'Escudo de Hierro', 'Un escudo resistente', 'Hierro', 5.0, 75));
    transacciones = new TransactionManager();
    transacciones.addTransaction(transaction1);
    transacciones.addTransaction(transaction2);
    transacciones.addTransaction(transaction3);
    informe = new reportGen(inventory, transacciones);
  });

  test('debería mostrar un mensaje si no hay transacciones', async () => {
    inventory = new GoodsManager();
    transacciones = new TransactionManager(); 
    informe = new reportGen(inventory, transacciones);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.calcularIngresosYGastos();
    expect(consoleSpy).toHaveBeenCalledWith('No hay transacciones registradas.');
    consoleSpy.mockRestore();
  });

  test('debería mostrar la información de los gastos e ingresos', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.calcularIngresosYGastos();
    expect(consoleSpy).toHaveBeenCalledWith('\nResumen de ingresos y gastos:');
    expect(consoleSpy).toHaveBeenCalledWith("Total de ingresos por ventas: 150 monedas");
    expect(consoleSpy).toHaveBeenCalledWith("Total de gastos en adquisiciones: 350 monedas");
    consoleSpy.mockRestore();
  });
});

describe('consultarHistorico', () => {
  let inventory: GoodsManager;
  let informe: reportGen;
  let transacciones: TransactionManager;
  const good1 = new Good(1, "Espada de Acero", "Una espada afilada hecha de acero de alta calidad.", "Acero", 2.5, 300);
  const good2 = new Good(2, "Escudo de Madera", "Un escudo resistente hecho de roble.", "Madera", 1.8, 150 );
  const good3 = new Good(3, "Poción de Salud", "Una poción mágica que restaura la salud.", "Vidrio", 0.5, 50 );
  const merchant = new Merchant( 1, "El Mercader Errante", "Comerciante de armas y pociones", "Ciudad de Acero");
  const customer = new Customer( 1, "Aragorn", "Humano", "Rivendell");
  const transaction1 = new Transaction(1, new Date("2023-05-10"), customer, [good1, good3], 1, "Compra");
  const transaction2 = new Transaction(2, new Date("2023-05-10"), merchant, [good2], 0, "Venta");
  const transaction3 = new Transaction(3, new Date("2023-05-10"), customer, [good1], 1, "Devolución");

  beforeEach(() => {
    inventory = new GoodsManager();
    inventory.addItem(new Good(1, 'Espada de Fuego', 'Una espada ardiente', 'Hierro', 3.5, 100));
    inventory.addItem(new Good(2, 'Escudo de Hierro', 'Un escudo resistente', 'Hierro', 5.0, 75));
    transacciones = new TransactionManager();
    transacciones.addTransaction(transaction1);
    transacciones.addTransaction(transaction2);
    transacciones.addTransaction(transaction3);
    informe = new reportGen(inventory, transacciones);
  });

  test('debería mostrar un mensaje si no hay transacciones para esa persona', async () => {
    const promptSpy = vi.spyOn(inquirer, 'prompt').mockResolvedValue({ nombre: 'Pepe' });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarHistorico();
    expect(consoleSpy).toHaveBeenCalledWith('No se encontraron transacciones para \'Pepe\'.');
    promptSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  test('debería mostrar la información de las transacciones de la persona', async () => {
    const promptSpy = vi.spyOn(inquirer, 'prompt').mockResolvedValue({ nombre: 'Aragorn' });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await informe.consultarHistorico();
    expect(consoleSpy).toHaveBeenCalledWith('\nHistorial de transacciones para \'Aragorn\':');
    expect(consoleSpy).toHaveBeenCalledWith("ID: 1\nFecha: 10/05/2023\nTipo: Compra\nTotal: 1 monedas\nNúmero de bienes: 2");
    expect(consoleSpy).toHaveBeenCalledWith("ID: 3\nFecha: 10/05/2023\nTipo: Devolución\nTotal: 1 monedas\nNúmero de bienes: 1");
    promptSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});