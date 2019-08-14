export class Sentence {
  constructor(text?: string, placeholders?: Array<Array<string>>) {
    this.text = text || '';
    this.placeholders = placeholders || new Array<Array<string>>();
  }

  text: string;

  placeholders: Array<Array<string>>;

  entityPatternsCount: number;
}
