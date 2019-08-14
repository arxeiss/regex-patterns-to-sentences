import uuidV4 from 'uuid/v4';

export class SentenceBatch {
  private sentences = new Array<string>();

  push(...sentences: string[]) {
    this.sentences.push(...sentences);
  }

  getAll(): Array<string> {
    return this.sentences;
  }

  toString(): string {
    return this.sentences.join('\n');
  }

  toDialogFlowJSON(): Array<any> {
    const dfJSON = new Array();

    this.sentences.forEach(sentence => {
      dfJSON.push({
        id: uuidV4(),
        data: [{ text: sentence, userDefined: false }],
        isTemplate: false,
        count: 0,
        updated: 0
      });
    });

    return dfJSON;
  }
}
