import { SentenceBatch } from './Sentence/SentenceBatch';
import { Sentence } from './Sentence/Sentence';
import { RegexParser } from './RegexParser';
import { CombinationGenerator } from './helpers/CombinationGenerator';
import { EntityMap } from './Entity/EntityMap';
import { EntityConfig } from './Config/EntityConfig';
import { EntityOption } from './Entity/EntityOption';
import { Config } from './Config/Config';

export class RegexToSentenceGenerator {
  private entityMap = new EntityMap();

  processEntities(entities: Map<string, EntityConfig>) {
    const newEntityMap = new EntityMap();

    entities.forEach((entity: EntityConfig, name: string) => {
      const entityOptions = new Array<EntityOption>();
      entity.phrases.forEach((phrase: string) => {
        entityOptions.push(RegexParser.extractEntityOptions(phrase));
      });
      newEntityMap.add(name, entityOptions, entity.alias, entity.meta);
    });

    this.entityMap = EntityMap.mergeIntoNew(this.entityMap, newEntityMap);
  }

  processSentences(sentences: Array<any>): SentenceBatch {
    const batch = new SentenceBatch();

    sentences.forEach((line: any) => {
      if (line === Object(line)) {
        if (line.sentence) {
          batch.push(...this.processSentence(line.sentence, line.repeat).getAll());
        } else if (line.entities) {
          this.processEntities(Config.fromPlainObject(line).entities);
        }
      } else if (typeof line === 'string') {
        batch.push(...this.processSentence(line).getAll());
      }
    });

    return batch;
  }

  processSentence(sentenceLine: string, repeat?: number): SentenceBatch {
    sentenceLine = sentenceLine.trim();
    repeat = repeat || 1;

    const { textWithEntities, entityMap } = RegexParser.extractEntities(sentenceLine);

    let inlineEntityMap: EntityMap = null;
    if (!entityMap.isEmpty()) {
      // If is inside sentence - used only for this instance
      inlineEntityMap = EntityMap.mergeIntoNew(this.entityMap, entityMap);
    }

    const { textWithPlaceholders, placeholders } = RegexParser.extractOptions(textWithEntities);
    const batch = new SentenceBatch();

    for (let i = 0; i < repeat; i++) {
      CombinationGenerator.manyToMany(placeholders).forEach(combination => {
        batch.push(new Sentence(textWithPlaceholders, combination, inlineEntityMap || this.entityMap));
      });
    }

    return batch;
  }
}
