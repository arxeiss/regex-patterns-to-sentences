import fs from 'fs-extra';
import { SentenceBatch } from './Sentence/SentenceBatch';
import { Sentence } from './Sentence/Sentence';
import { RegexParser } from './RegexParser';
import { CombinationGenerator } from './CombinationGenerator';
import { EntityMap } from './Entity/EntityMap';

export class RegexToSentenceGenerator {
  private entityMap = new EntityMap();

  processFile(sentencesFilePath: string): SentenceBatch {
    if (!fs.pathExistsSync(sentencesFilePath)) {
      throw 'Pass path to file to parse or create file sentences.txt';
    }

    const batch = new SentenceBatch();

    fs.readFileSync(sentencesFilePath)
      .toString()
      .split(/[\n\r]+/)
      .forEach((sentence: string) => {
        const singleSentenceBatch = this.processSentence(sentence);
        if (singleSentenceBatch !== null) {
          batch.push(...singleSentenceBatch.getAll());
        }
      });

    return batch;
  }

  processSentence(sentenceLine: string): SentenceBatch {
    sentenceLine = sentenceLine.trim();
    // Handle comments and empty lines
    if (sentenceLine.startsWith('#') || sentenceLine.length === 0) {
      return null;
    }

    const { textWithEntities, entityMap } = RegexParser.extractEntities(sentenceLine);
    if (!entityMap.isEmpty()) {
      this.entityMap = EntityMap.mergeIntoNew(this.entityMap, entityMap);
      this.entityMap.shuffleEntityPhrasesOptions();
    }

    if (RegexParser.isSingleEntityDefinition(sentenceLine)) {
      return null;
    }

    const { textWithPlaceholders, placeholders } = RegexParser.extractOptions(textWithEntities);
    const batch = new SentenceBatch();
    CombinationGenerator.manyToMany(placeholders).forEach(combination => {
      batch.push(new Sentence(textWithPlaceholders, combination, this.entityMap));
    });

    return batch;
  }
}
