import { EntityOption } from './EntityOption';
import { RandomNumber } from '../helpers/Random';

export class Entity {
  public name: string;
  public alias?: string;
  public meta?: string;
  public options: Array<EntityOption>;

  constructor(name: string, options?: Array<EntityOption>, alias?: string, meta?: string) {
    this.name = name;
    this.options = options || new Array<EntityOption>();
    this.alias = alias || name.replace('@', '');
    this.meta = meta || name;
  }

  getNextPhrase(): string {
    if (this.options.length === 0) {
      throw `Entity with name ${this.name} does not contain any phrases`;
    }

    return this.options[RandomNumber.upTo(this.options.length - 1)].getNextPhrase();
  }
}
