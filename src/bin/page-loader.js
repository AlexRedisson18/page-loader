#!/usr/bin/env node

import program from 'commander';
import { description, version } from '../../package.json';
import downloadPage from '..';

program
  .version(`${version}`, '-V, --version')
  .description(`${description}`)
  .option('-o, --output [path]', 'output directory', process.cwd())
  .arguments('<url>')
  .action(url => downloadPage(url, program.output)
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    }))
  .parse(process.argv);
