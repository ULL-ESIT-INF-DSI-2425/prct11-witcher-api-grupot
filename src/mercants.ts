export class Merchant {
  constructor(
    public id: number,
    public name: string,
    public type: string,
    public location: string
  ) {}

  get getId() { return this.id; };
  get getName() { return this.name; };
  get getType() { return this.type; };
  get getLocation() { return this.location; };

  setId(new_id: number) { this.id = new_id; };
  setName(new_name: string) { this.name = new_name; };
  setType(new_type: string) { this.type = new_type; };
  setLocation(new_location: string) { this.location = new_location; };
}