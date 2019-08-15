export class Entity {
  public name: string;
  public phrases: Array<string>;
  private iterator: number = 0;

  constructor(name: string, phrases?: Array<string>) {
    this.name = name;
    this.phrases = phrases || new Array<string>();
  }

  getNextPhrase(): string {
    if (this.phrases.length === 0) {
      throw `Entity with name ${this.name} does not contain any phrases`;
    }

    if (this.iterator >= this.phrases.length) {
      this.iterator = 0;
    }
    const next = this.phrases[this.iterator];
    this.iterator += 1;

    return next;
  }

  shufflePhrasesOptions() {
    for (let i = this.phrases.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.phrases[i], this.phrases[j]] = [this.phrases[j], this.phrases[i]];
    }
  }
}
