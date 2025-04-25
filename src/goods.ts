export class Good {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public material: string,
    public weight: number,
    public value: number
  ) {}

  get getId() { return this.id; };
  get getName() { return this.name; };
  get getDescription() { return this.description; };
  get getMaterial() { return this.material; };
  get getWeight() { return this.weight; };
  get getValue() { return this.value; };

  setId(new_id: number) { this.id = new_id; };
  setName(new_name: string) { this.name = new_name; };
  setDescription(new_desc: string) { this.description = new_desc; };
  setMaterial(new_mat: string) { this.material = new_mat; };
  setWeight(new_weight: number) { this.weight = new_weight; };
  setValue(new_value: number) { this.value = new_value; };
}