import { CombinationGenerator } from '../helpers/CombinationGenerator';
import util from 'util';

export class EntityOption {
  textWithPlaceholders: string;

  placeholders: Array<Array<string>>;

  constructor(textWithPlaceholders: string, placeholders: Array<Array<string>>) {
    this.textWithPlaceholders = textWithPlaceholders;
    this.placeholders = placeholders;
  }

  getNextPhrase(): string {
    return util.format(this.textWithPlaceholders, ...CombinationGenerator.randomOption(this.placeholders));
  }
}
