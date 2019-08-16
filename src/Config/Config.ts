import { Output } from './Output';
import { EntityConfig } from './EntityConfig';
import { plainToClass, Type } from 'class-transformer';

export class Config {
  @Type(() => Output)
  output: Output;

  @Type(() => EntityConfig)
  entities: Map<string, EntityConfig>;

  sentences: Array<any>;

  static fromPlainObject(plainObject: any) {
    return plainToClass(Config, plainObject);
  }
}
