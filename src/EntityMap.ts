import { Entity } from './Entity';

export class EntityMap {
  private data = new Map<string, Entity>();

  addEntity(name: string, phrases: Array<string>) {
    this.data.set(name, new Entity(name, phrases));
  }

  getNextPhrase(name: string): string {
    if (!this.data.has(name)) {
      throw `Entity with name ${name} was not initialized`;
    }

    return this.data.get(name).getNextPhrase();
  }

  isEmpty(): boolean {
    return this.data.size === 0;
  }

  shuffleEntityPhrasesOptions() {
    this.data.forEach((entity: Entity) => {
      entity.shufflePhrasesOptions();
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
