#!/usr/bin/env node

/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */

process.title = 'promod-generator';

const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;

const { createPageStructure } = require('../built/generate');

if (argv.clihelp) {
  console.info(`
    Usage:
      --clihelp - get usage description
      --file="/path/to/page.ts" - generate actions for required page
  `);
  process.exit(0);
}

if (!argv.file) {
  throw new Error('"file" argument should exist');
}

if (!fs.existsSync(argv.file)) {
  throw new Error('"file" should exist, please check file path which you use');
}

createPageStructure(argv.file);
