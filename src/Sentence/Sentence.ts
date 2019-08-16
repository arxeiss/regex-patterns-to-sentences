import { EntityMap } from '../Entity/EntityMap';
import util from 'util';
import { RegexParser } from '../RegexParser';

export class Sentence {
  text: string;

  placeholders: Array<string>;

  entityMap: EntityMap;

  constructor(text?: string, placeholders?: Array<string>, entityMap?: EntityMap) {
    this.text = text || '';
    this.placeholders = placeholders || null;
    this.entityMap = entityMap || null;
  }

  toString(): string {
    let stringified = RegexParser.replaceEntityPlaceholder(this.replacePlaceholders(), entityName => {
      return this.entityMap.getNextPhrase(entityName);
    }).trim();

    return stringified;
  }

  toDfJSON() {
    const dfJSON = RegexParser.splitByEntityPlaceholders(this.replacePlaceholders())
      .map((textPart: string) => {
        if (textPart.length === 0) {
          return null;
        }
        const matches = RegexParser.matchEntityPlaceholder(textPart);

        if (matches && matches[1]) {
          return {
            text: this.entityMap.getNextPhrase(matches[1]),
            alias: matches[1],
            meta: `@${matches[1]}`,
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
}
