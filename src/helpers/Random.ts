export class RandomNumber {
  static between(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  static upTo(max: number): number {
    return this.between(0, max);
  }
}
