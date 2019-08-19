import { EntityMap } from '../Entity/EntityMap';
import util from 'util';
import { RegexParser } from '../RegexParser';
import { ContextRandomNumber } from '../helpers/ContextRandomNumber';
import crypto from 'crypto';

export class Sentence {
  originalSentence: string;

  text: string;

  placeholders: Array<string>;

  entityMap: EntityMap;

  constructor(originalSentence: string, text?: string, placeholders?: Array<string>, entityMap?: EntityMap) {
    this.originalSentence = originalSentence;
    this.text = text || '';
    this.placeholders = placeholders || null;
    this.entityMap = entityMap || null;
  }

  toString(): string {
    this.setContextOfRandomGenerator();

    let stringified = RegexParser.replaceEntityPlaceholder(this.replacePlaceholders(), entityName => {
      return this.entityMap.get(entityName).getNextPhrase();
    }).trim();

    return stringified;
  }

  toDfJSON() {
    this.setContextOfRandomGenerator();

    const dfJSON = RegexParser.splitByEntityPlaceholders(this.replacePlaceholders())
      .map((textPart: string) => {
        if (textPart.length === 0) {
          return null;
        }
        const matches = RegexParser.matchEntityPlaceholder(textPart);

        if (matches && matches[1]) {
          const entity = this.entityMap.get(matches[1]);
          return {
            text: entity.getNextPhrase(),
            alias: entity.alias,
            meta: entity.meta,
            userDefined: false
          };
        } else {
          return {
            text: textPart,
            userDefined: false
          };
        }
      })
      .filter((v: any) => v);

    // Ltrim first item and rtrim last item
    if (dfJSON.length > 0) {
      dfJSON[0].text = dfJSON[0].text.replace(/^\s+/, '');
      dfJSON[dfJSON.length - 1].text = dfJSON[dfJSON.length - 1].text.replace(/\s+$/, '');
    }

    return dfJSON;
  }

  private replacePlaceholders(): string {
    return util.format(this.text, ...this.placeholders).replace('\\?', '?');
  }

  private setContextOfRandomGenerator() {
    ContextRandomNumber.setContext(
      crypto
        .createHash('sha256')
        .update(this.originalSentence, 'utf8')
        .digest('hex')
    );
  }
}
