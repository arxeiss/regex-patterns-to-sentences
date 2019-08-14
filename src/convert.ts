import { RegexToSentenceGenerator } from './RegexToSentenceGenerator';
import fs from 'fs-extra';

const sentencesFilePath = process.argv[2] || 'sentences.txt';

try {
  const dfJSON = new RegexToSentenceGenerator().processFile(sentencesFilePath).toDialogFlowJSON();
  fs.writeFileSync('dialogFlowOutput.json', JSON.stringify(dfJSON, null, 2));
} catch (error) {
  console.error(error);
}
