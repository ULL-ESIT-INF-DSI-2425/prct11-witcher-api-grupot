import { Transaction } from './transaction.js';

export class TransactionManager {
  private transactions: Transaction[] = [];

  get getTransactions(): Transaction[] {
    return this.transactions;
  }

  // Add a new transaction
  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }
  
  /**
   * Método que nos devuelve todas las transacciones
   * del vector de almacenamiento
   * @returns Lista de transacciones
   */
  listTransactions() {
    return this.transactions;
  }
}