import seedrandom from 'seedrandom';

export class ContextRandomNumber {
  static seed: string = null;
  static useContext: boolean = false;

  private static context: string = null;
  private static generator: seedrandom.prng = seedrandom();

  static init(seed: string, useContext: boolean) {
    this.seed = seed;
    this.useContext = useContext;

    this.createGenerator();
  }

  static setContext(context: string) {
    if (ContextRandomNumber.useContext && context !== this.context) {
      this.context = context;

      this.createGenerator();
    }
  }

  private static createGenerator() {
    let seed = ContextRandomNumber.seed;
    if (seed && ContextRandomNumber.useContext) {
      seed = `${seed}-${this.context}`;
    }

    this.generator = seedrandom(seed);
  }

  static between(min: number, max: number): number {
    return Math.floor(this.generator() * (max - min + 1) + min);
  }

  static upTo(max: number): number {
    return this.between(0, max);
  }
}
