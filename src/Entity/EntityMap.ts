import { Entity } from './Entity';
import { EntityOption } from './EntityOption';

export class EntityMap {
  private data = new Map<string, Entity>();

  add(name: string, options: Array<EntityOption>, alias?: string, meta?: string) {
    this.data.set(name.replace('@', ''), new Entity(name, options, alias, meta));
  }

  get(name: string): Entity {
    if (!this.data.has(name)) {
      throw `Entity with name ${name} was not initialized`;
    }

    return this.data.get(name);
  }

  isEmpty(): boolean {
    return this.data.size === 0;
  }

  static mergeIntoNew(...entities: EntityMap[]): EntityMap {
    const newEntityMap = new EntityMap();

    entities.forEach((entityMap: EntityMap) => {
      entityMap.data.forEach((entity: Entity, name: string) => {
        newEntityMap.data.set(name, entity);
      });
    });

    return newEntityMap;
  }
}
