import 'reflect-metadata';
import { RegexToSentenceGenerator } from './RegexToSentenceGenerator';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { Config } from './Config/Config';
import path from 'path';
import { ContextRandomNumber } from './helpers/ContextRandomNumber';
import meow from 'meow';

const cli = meow(
  `
	Usage
	  $ npm run convert -- [-c|--config <config.yaml>] [-t|--template <template.json>]

	Options
    --config, -c  Path to config file, if omitted config.yaml is searched for
    --template, -t  Template of DialogFlow JSON output file
    --help, -h Show this help
`,
  {
    flags: {
      config: {
        type: 'string',
        alias: 'c',
        default: 'config.yaml'
      },
      template: {
        type: 'string',
        alias: 't'
      }
    }
  }
);

console.log(cli.input, cli.flags);

(async () => {
  try {
    const configPath = path.resolve(cli.input[0] || cli.flags.config);

    if (!fs.pathExistsSync(configPath)) {
      throw 'Config file does not exists. Pass --config flag or create config.yaml';
    }

    const templatePath = cli.flags.template || cli.input[1] || null;
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
