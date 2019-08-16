import 'reflect-metadata';
import { RegexToSentenceGenerator } from './RegexToSentenceGenerator';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { Config } from './Config/Config';

try {
  const configPath = process.argv[2] || 'config.yaml';
  if (!fs.pathExistsSync(configPath)) {
    throw 'Pass path to config file or create config.yaml';
  }

  const config = Config.fromPlainObject(yaml.safeLoad(fs.readFileSync(configPath, 'utf8')));

  const generator = new RegexToSentenceGenerator();
  generator.processEntities(config.entities);
  const dfSentences = generator.processSentences(config.sentences);

  if (config.output.stdout === true) {
    console.log(dfSentences.toString());
  }

  if (typeof config.output.dialogFlowJSONFile === 'string') {
    fs.writeFileSync(config.output.dialogFlowJSONFile, JSON.stringify(dfSentences.toDialogFlowJSON(), null, 2));
  }
} catch (error) {
  console.error(error);
}
