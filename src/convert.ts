import { RegexToSentenceGenerator } from './RegexToSentenceGenerator';
import fs from 'fs-extra';

const sentencesFilePath = process.argv[2] || 'sentences.txt';

try {
  const dfSentences = new RegexToSentenceGenerator().processFile(sentencesFilePath);

  console.log(dfSentences.toString());

  fs.writeFileSync('dialogFlowOutput.json', JSON.stringify(dfSentences.toDialogFlowJSON(), null, 2));
} catch (error) {
  console.error(error);
}
