import { Entity } from './Entity';
import { EntityOption } from './EntityOption';

export class EntityMap {
  private data = new Map<string, Entity>();

  add(name: string, options: Array<EntityOption>, alias?: string, meta?: string) {
    if (!name.startsWith('@')) {
      name = `@${name}`;
    }
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

  replaceOptions(...entities: EntityMap[]) {
    entities.forEach((entityMap: EntityMap) => {
      entityMap.data.forEach((entity: Entity, name: string) => {
        if (this.data.has(name)) {
          this.data.get(name).options = entity.options;
        } else {
          this.add(name, entity.options, entity.alias, entity.meta);
        }
      });
    });
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
