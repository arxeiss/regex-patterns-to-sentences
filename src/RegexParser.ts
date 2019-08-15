import { CombinationGenerator } from './CombinationGenerator';
import util from 'util';
import { EntityMap } from './EntityMap';

export class RegexParser {
  private static optionsRegex = RegExp(/\(([^)]+)\)(\?)?(\s*)/g);
  private static entityPatternRegex = RegExp(/@([a-z0-9_.\-]+)(?:\{([^\}]+)\})?/gi);
  private static entityDefinitionMatchRegex = RegExp(/^@([a-z0-9_.\-]+)\{([^\}]+)\}$/i);
  private static entityPlaceholderSplitterRegex = RegExp(/(%\{[a-z0-9_.\-]+\})/gi);
  private static entityPlaceholderMatchRegex = RegExp(/^%\{([a-z0-9_.\-]+)\}$/i);
  private static entityPlaceholderReplaceRegex = RegExp(/%\{([a-z0-9_.\-]+)\}/gi);

  static extractOptions(text: string) {
    const placeholders = new Array<Array<string>>();
    let matches: any;
    let textWithPlaceholders = text;

    while ((matches = this.optionsRegex.exec(text)) !== null) {
      // Cannot be replaced in original text - regex.exec then doesn't work correctly
      textWithPlaceholders = textWithPlaceholders.replace(matches[0], '%s');

      const possibilities = new Array<string>();
      if (matches[2] === '?') {
        possibilities.push('');
      }
      possibilities.push(...matches[1].split('|').map((phrase: any) => `${phrase}${matches[3]}`));

      placeholders.push(possibilities);
    }

    return { textWithPlaceholders, placeholders };
  }

  static extractEntities(text: string) {
    let matches: any;
    let textWithEntities = text;
    const entityMap = new EntityMap();

    while ((matches = this.entityPatternRegex.exec(text)) !== null) {
      // Cannot be replaced in original text - regex.exec then doesn't work correctly
      textWithEntities = textWithEntities.replace(matches[0], `%{${matches[1]}}`);

      if (matches[2]) {
        const phrases = new Array<string>();
        // Filter here remove empty items
        matches[2]
          .split(';')
          .filter((v: string) => v)
          .forEach((entityOption: string) => {
            const { textWithPlaceholders, placeholders } = this.extractOptions(entityOption);

            CombinationGenerator.manyToMany(placeholders).forEach(combination => {
              phrases.push(util.format(textWithPlaceholders, ...combination));
            });
          });

        entityMap.addEntity(matches[1], phrases);
      }
    }

    return { textWithEntities, entityMap };
  }

  static isSingleEntityDefinition(text: string): boolean {
    return this.entityDefinitionMatchRegex.exec(text) !== null;
  }

  static splitByEntityPlaceholders(text: string): Array<string> {
    // Filter remove empty items
    return text.split(this.entityPlaceholderSplitterRegex).filter((v: string) => v);
  }

  static matchEntityPlaceholder(text: string): RegExpExecArray {
    return this.entityPlaceholderMatchRegex.exec(text);
  }

  static replaceEntityPlaceholder(text: string, replaceCallback: (name: string) => string): string {
    return text.replace(this.entityPlaceholderReplaceRegex, (wholeMatch, entityName) => {
      return replaceCallback(entityName);
    });
  }
}
