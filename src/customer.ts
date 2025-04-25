export class Customer {
  constructor(
    public id: number,
    public name: string,
    public race: string,
    public location: string
  ) {}

  get getId() { return this.id; };
  get getName() { return this.name; };
  get getRace() { return this.race; };
  get getLocation() { return this.location; };

  setId(new_id: number) { this.id = new_id; };
  setName(new_name: string) { this.name = new_name; };
  setRace(new_race: string) { this.race = new_race; };
  setLocation(new_location: string) { this.location = new_location; };
}