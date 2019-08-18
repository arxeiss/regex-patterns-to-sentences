import { Output } from './Output';
import { EntityConfig } from './EntityConfig';
import { plainToClass, Type } from 'class-transformer';
import { Random } from './Random';

export class Config {
  @Type(() => Map)
  vars: Map<string, any>;

  @Type(() => Output)
  output: Output;

  @Type(() => Random)
  random: Random;

  @Type(() => EntityConfig)
  entities: Map<string, EntityConfig>;

  sentences: Array<any>;

  static fromPlainObject(plainObject: any) {
    return plainToClass(Config, plainObject);
  }

  applyVars(text: string): string {
    if (typeof text !== 'string' || !this.vars || this.vars.size === 0) {
      return text;
    }

    return text.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (wholeMatch: string, varName: string) => {
      if (this.vars.has(varName)) {
        return this.vars.get(varName);
      }

      return wholeMatch;
    });
  }
}
