export class Asset {
  constructor(
    public id: string,
    public hash: string | null,
    public size: number,
    public from: string,
    public to: string
  ) {}
}
