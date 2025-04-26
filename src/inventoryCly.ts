import inquirer from "inquirer";
import { GoodsManager } from "./goodsManager.js";
import { Good } from "./goods.js";
import { MerchantManager } from "./mercant_manager.js";
import { CustomerManager } from "./customerManager.js";
// import { Merchant } from './mercants.js';
// import { Customer } from './other_clients.js';
import { TransactionManager } from './transaction_manager.js';

export class InventoryCLI {
  private inventory: GoodsManager;
  private merchantManager: MerchantManager;
  private customerManager: CustomerManager;
  private transactionManager: TransactionManager;

  constructor(inventory: GoodsManager, merchantManager: MerchantManager, 
    customerManager: CustomerManager, transactionManager: TransactionManager) {
    this.inventory = inventory;
    this.merchantManager = merchantManager;
    this.customerManager = customerManager;
    this.transactionManager = transactionManager;
  }

  async mainMenu() {
    const choices = [
      "Gestionar bienes",
      "Consultar mercaderes",
      "Buscar clientes",
      "Salir",
    ];

    const { option } = await inquirer.prompt({
      type: "list",
      name: "option",
      message: "Selecciona una opción:",
      choices,
    });

    switch (option) {
      case "Gestionar bienes":
        await this.manageGoods();
        break;
      case "Consultar mercaderes":
        await this.consultMerchants();
        break;
      case "Buscar clientes":
        await this.consultCustomers();
        break;
      case "Salir":
        console.log("Saliendo...");
        return;
    }
    await this.mainMenu();
  }

  async manageGoods() {
    const choices = [
      "Agregar bien",
      "Eliminar bien",
      "Listar bienes",
      "Volver",
    ];
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "¿Qué deseas hacer?",
      choices,
    });
    if (action === "Agregar bien") {
      const { id, name, description, material, weight, value } = await inquirer.prompt([
        { type: "number", name: "id", message: "Id del objeto:"},
        { type: "input", name: "name", message: "Nombre del bien:" },
        { type: "input", name: "description", message: "Breve descripción:" },
        { type: "input", name: "material", message: "Material del que está hecho:" },
        { type: "number", name: "weight", message: "Peso del objeto:" },
        { type: "number", name: "value", message: "Valor en coronas:" },
      ]);
      const newGood = new Good(id, name, description, material, weight, value);
      this.inventory.addItem(newGood);
      console.log("Bien agregado con éxito.");
    }

    if (action === "Eliminar bien") {
      const { id } = await inquirer.prompt({
        type: "number",
        name: "id",
        message: "ID del bien a eliminar:",
      });
      this.inventory.removeItem(id);
      console.log("Bien eliminado (si existía).");
    }

    if (action === "Listar bienes") {
      const { orderBy, ascending } = await inquirer.prompt([
        {
          type: "list",
          name: "orderBy",
          message: "Ordenar por:",
          choices: ["name", "value"],
        },
        { type: "confirm", name: "ascending", message: "Orden ascendente?" },
      ]);
      console.log(
        this.inventory.listItems(orderBy as "name" | "value", ascending)
      );
    }
  }

  async consultMerchants() {
    const { name } = await inquirer.prompt({
      type: "input",
      name: "name",
      message: "Nombre del mercader:",
    });
    const merchant = this.merchantManager.findMerchantByName(name);
    console.log(merchant || "Mercader no encontrado.");
  }

  async consultCustomers() {
    const { name } = await inquirer.prompt({
      type: "input",
      name: "name",
      message: "Nombre del cliente:",
    });
    const customer = this.customerManager.findCustomerByName(name);
    console.log(customer || "Cliente no encontrado.");
  }
}
