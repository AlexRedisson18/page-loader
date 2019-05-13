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
    .then(() => console.log('Page was successfully downloaded'))
    .catch(e => console.error(`${e.stack} ${e.code} ${e.name}: ${e.message}`)))

  .parse(process.argv);
