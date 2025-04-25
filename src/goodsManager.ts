import { Good } from './goods.js';

// Clase de gestión del inventario
export class GoodsManager {
  private _items: Good[] = [];

  get items() { return this._items; };

  /**
   * Añade un item al inventario
   * @param item - (Good) item que se añadirá
   */
  addItem(item: Good) {
    this._items.push(item);
  }

  /**
   * Elimina un item con un id específico
   * @param id - (number) id del objeto
   */
  removeItem(id: number) {
    this._items = this._items.filter(item => item.id !== id);
  }

  /**
   * Modifica un bien existente en el inventario
   * @param id - (number) ID del bien a modificar.
   * @param name - (string?) nuevo nombre.
   * @param description - (string?) nueva descripción.
   * @param material - (string?) nuevo material.
   * @param weight - (number?) nuevo peso.
   * @param value - (number?) nuevo valor.
   */
  updateGood( id: number, name?: string, description?: string, material?: string, weight?: number, value?: number ) {
    const good = this._items.find(item => item.id === id);
    if (good) {
      if (name !== undefined) good.name = name;
      if (description !== undefined) good.description = description;
      if (material !== undefined) good.material = material;
      if (weight !== undefined) good.weight = weight;
      if (value !== undefined) good.value = value;
    }
  }

  /**
   * Lista todos los items almacenados en orden ascendente por defecto
   * @param orderBy - (string) ordena los objetos según el atributo seleccionado
   * @param ascending - (bool?) si queremos orden asscendente o descendente
   * @returns - (Good[]) lista de bienes que tenemos en el inventario
   */
  listItems(orderBy: 'name' | 'value' = 'name', ascending: boolean = true): Good[] {
    return this._items.sort((a, b) => {
      const factor = ascending ? 1 : -1;
      return a[orderBy] > b[orderBy] ? factor : -factor;
    });
  }

  /** 
   * Método para consultar información de bienes especificos
   * @param id - (number) id del bien a consultar
   * @returns - (Good | undefined) bien consultado
   */
  findItemById(id: number): Good | undefined {
    return this._items.find(item => item.id === id);
  }

  /**
   * Método para localizar bienes a través de su nombre
   * @param name - (string) nombre del bien
   * @returns - (Good[])
   */
  findItemByName(name: string): Good[] {
    return this._items.filter((item) => item.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Método para localizar bienes a través de su material
   * @param material - (string) material del bien
   * @returns - (Good[])
   */
  findItemByMaterial(material: string): Good[] {
    return this._items.filter((item) => item.material.toLowerCase() === material.toLowerCase());
  }
  
  
  /**
   * Verifica si el peso total de cada bien esencial es inferior a 1 kg.
   * Se define una lista de ingredientes esenciales y se suma el peso de todos los bienes en el inventario
   * con ese nombre. Si el peso total es menor a 1 kg, se incluye un representante de ese bien en la lista.
   * @returns - (Good[]) lista de bienes (representantes) cuyo peso total es insuficiente.
   */
  checkStockShortage(): Good[] {
    const ItemBasicos = ["Harina", "Azúcar", "Leche", "Huevos", "Mantequilla"];
    const lista_compra: Good[] = [];
    
    for (const name of ItemBasicos) {
     const goods = this.findItemByName(name);
     if (goods.length > 0) {
       const totalWeight = goods.reduce((sum, item) => sum + item.getWeight, 0);
       if (totalWeight < 1) {
        // Se añade el primer bien de ese tipo como representante
        lista_compra.push(goods[0]);
       }
     }
    }
    return lista_compra;
  }
}



