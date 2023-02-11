export class Required {
  value: boolean;
  def: boolean;
  constructor(value?: boolean, def?: boolean) {
    this.value = value == null ? true : value;
    this.def = def == null ? true : def;
  }
}
