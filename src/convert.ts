import 'reflect-metadata';
import { RegexToSentenceGenerator } from './RegexToSentenceGenerator';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { Config } from './Config/Config';
import path from 'path';
import { ContextRandomNumber } from './helpers/ContextRandomNumber';

(async () => {
  try {
    const configPath = path.resolve(process.argv[2] || 'config.yaml');

    if (!fs.pathExistsSync(configPath)) {
      throw 'Pass path to config file or create config.yaml';
    }

    const templatePath = process.argv[2] && process.argv[3];
    const config = Config.fromPlainObject(yaml.safeLoad(await fs.readFile(configPath, 'utf8')));

    ContextRandomNumber.init(config.random.seed || null, config.random.contextualSeed || false);

    const generator = new RegexToSentenceGenerator(config);
    generator.processEntities(config.entities);
    const dfSentences = generator.processSentences(config.sentences);

    if (config.output.stdout === true) {
      console.log(dfSentences.toString());
      console.info('\n');
    }

    if (typeof config.output.dialogFlowJSONFile === 'string') {
      let outputPath = config.output.dialogFlowJSONFile;

      if (!path.isAbsolute(outputPath)) {
        outputPath = `${path.dirname(configPath)}${path.sep}${outputPath}`;
      }

      let template: any = {};
      if (templatePath) {
        template = await fs.readJSON(templatePath);
        template.userSays = dfSentences.toDialogFlowJSON();
      } else {
        template = dfSentences.toDialogFlowJSON();
      }

      await fs.writeFile(outputPath, JSON.stringify(template, null, 2));
    }

    console.info(`Everything done - totally generated ${dfSentences.getAll().length} sentences`);
  } catch (e) {
    console.error(e);
  }
})();
