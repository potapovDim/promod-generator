#!/usr/bin/env node

/* eslint-disable */

process.title = 'promod-generator';

const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;

const { createPageStructure } = require('../built/generate');
const { createTemplateConfig } = require('../built/config.template');

if (argv.clihelp) {
  console.info(`
    Usage:
      --clihelp                     - get usage description
      --generate-config             - generate base config
      --file="/path/to/page.ts"     - generate actions for required page
  `);
  process.exit(0);
}

if (argv.ts) {
  require('ts-node').register({
    compilerOptions: {
      module: 'commonjs',
    },
    disableWarnings: true,
    fast: true,
  });
}

if (argv['generate-config']) {
  createTemplateConfig();
} else if (!argv.file) {
  throw new Error('"file" argument should exist');
} else if (!fs.existsSync(argv.file)) {
  throw new Error('"file" should exist, please check file path which you use');
} else {
  createPageStructure(argv.file);
}
