import { Good } from "./goods.js";
import { Merchant } from "./mercants.js";
import { Customer } from "./customer.js";

// Clase para representar una transacción
export class Transaction {
  constructor(
      public id: number,
      public date: Date,
      public buyerOrSeller: Merchant | Customer,
      public goods: Good[],
      public totalAmount: number,
      public type: "Compra" | "Venta" | "Devolución"
  ) {}

  get getId() { return this.id; };
  get getDate() { return this.date; };
  get getBuyerSeller() { return this.buyerOrSeller; };
  get getGoods() { return this.goods; };
  get getTotalAmount() { return this.totalAmount; };
  get getType() { return this.type; };

  setId(new_id: number) { this.id = new_id; };
  setDate(new_date: Date) { this.date = new_date; };
  setBuyerSeller(new_buyer_seller: Merchant | Customer) { this.buyerOrSeller = new_buyer_seller; };
  setGoods(new_goods: Good[]) { this.goods = new_goods; };
  setTotalAmount(new_amount: number) { this.totalAmount = new_amount; };
  setType(new_type: "Compra" | "Venta" | "Devolución") { this.type = new_type; };

  /**
   * Calcula el total de la transacción sumando el valor de todos los bienes.
   */
  calcularTotal(): void {
  this.totalAmount = this.goods.reduce((sum, good) => sum + good.getValue, 0);
  }

  /**
   * Agrega un bien a la transacción.
   * @param good - El bien a agregar.
   */
  addGood(good: Good): void {
    this.goods.push(good);
    this.calcularTotal(); // Recalcula el total al añadir un bien
  }

  /**
   * Elimina un bien de la transacción.
   * @param goodId - El ID del bien a eliminar.
   */
  removeGood(goodId: number): void {
    this.goods = this.goods.filter(good => good.getId !== goodId); 
    this.calcularTotal(); // Recalcula el total después de eliminar un bien
  }

  /**
   * Verifica si la transacción es válida.
   * @returns `true` si la transacción es válida, `false` si no lo es.
   */
  isValid(): boolean {
    return this.goods.length > 0 && this.totalAmount > 0;
  }

  /**
   * Devuelve un resumen de la transacción en formato string.
   * @returns Resumen de la transacción.
   */
  getSummary(): string {
    const day = String(this.date.getDate()).padStart(2, '0');
    const month = String(this.date.getMonth() + 1).padStart(2, '0'); // Se suma 1 a getMonth()
    const year = this.date.getFullYear();
    return `ID: ${this.id}\nFecha: ${day}/${month}/${year}\nTipo: ${this.type}\nTotal: ${this.totalAmount} monedas\nNúmero de bienes: ${this.goods.length}`;
  }
}
