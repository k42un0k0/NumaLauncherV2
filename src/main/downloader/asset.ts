export class Asset {
  id: any;
  hash: string;
  size: number;
  from: string;
  to: string;
  constructor(id: any, hash: string, size: number, from: string, to: string) {
    this.id = id;
    this.hash = hash;
    this.size = size;
    this.from = from;
    this.to = to;
  }
}
