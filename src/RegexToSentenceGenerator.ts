import fs from 'fs-extra';
import util from 'util';
import { SentenceBatch } from './SentenceBatch';
import { Sentence } from './Sentence';

export class RegexToSentenceGenerator {
  private optionsRegex = RegExp(/\(([^)]+)\)(\?)?(\s*)/g);
  private patterns = new Map<string, any>();

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
        batch.push(...singleSentenceBatch.getAll());
      });

    return batch;
  }

  processSentence(sentenceLine: string): SentenceBatch {
    // Handle comments
    if (sentenceLine.startsWith('#')) {
      return new SentenceBatch();
    }

    const placeholders = new Array<Array<string>>();

    let matches: any;
    let sentenceWithPlaceholders = sentenceLine;
    while ((matches = this.optionsRegex.exec(sentenceLine)) !== null) {
      sentenceWithPlaceholders = sentenceWithPlaceholders.replace(matches[0], '%s');

      const possibilities = new Array<string>();
      if (matches[2] === '?') {
        possibilities.push('');
      }
      possibilities.push(...matches[1].split('|').map((phrase: any) => `${phrase}${matches[3]}`));

      placeholders.push(possibilities);
    }

    const sentence = new Sentence(sentenceWithPlaceholders, placeholders);

    return this.generateAllCombinations(sentence);
  }

  private processEntityPatterns(sentence: Sentence) {}

  private generateAllCombinations(sentence: Sentence): SentenceBatch {
    const combinations = new Array<Array<string>>();
    sentence.placeholders[0].forEach(val => {
      combinations.push([val]);
    });

    for (let i = 1; i < sentence.placeholders.length; i++) {
      const currentCombinations = combinations.splice(0);

      for (let c = 0; c < currentCombinations.length; c++) {
        const currentCombination = currentCombinations[c];

        for (let p = 0; p < sentence.placeholders[i].length; p++) {
          const element = sentence.placeholders[i][p];

          combinations.push([...currentCombination, element]);
        }
      }
    }

    const batch = new SentenceBatch();

    combinations.forEach(combination => {
      batch.push(util.format(sentence.text, ...combination));
    });

    return batch;
  }
}
