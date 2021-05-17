import { v4 } from 'uuid';
import { Sentence } from './Sentence';

export class SentenceBatch {
  private sentences = new Array<Sentence>();

  push(...sentences: Sentence[]) {
    this.sentences.push(...sentences);
  }

  getAll(): Array<Sentence> {
    return this.sentences;
  }

  toString(): string {
    return this.sentences.map((sentence: Sentence) => sentence.toString()).join('\n');
  }

  toDialogFlowJSON(): Array<any> {
    const dfJSON = new Array();

    this.sentences.forEach((sentence) => {
      dfJSON.push({
        id: v4(),
        data: sentence.toDfJSON(),
        isTemplate: false,
        count: 0,
        updated: 0,
      });
    });

    return dfJSON;
  }
}
