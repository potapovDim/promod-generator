/* eslint-disable sonarjs/cognitive-complexity, sonarjs/prefer-immediate-return*/
import * as path from 'path';
import * as fs from 'fs';

// import {
//   validateBaseLibraryDescription,
//   validateCollectionActionTypes,
//   validateCollectionWaitingTypes,
// } from './validator';

const expectedConfigPath = path.resolve(process.cwd(), './promod.generator.config.js');
const generalConfigPath = path.resolve(process.cwd(), './promod.system.config.js');

function getConfiguration() {
  if (!fs.existsSync(expectedConfigPath) && !fs.existsSync(generalConfigPath)) {
    throw new Error(`${expectedConfigPath} does not exist and ${generalConfigPath} does not exist`);
  }

  const config = require(fs.existsSync(expectedConfigPath) ? expectedConfigPath : generalConfigPath);

  /** @info validation section */
  // validateBaseLibraryDescription(config.baseLibraryDescription);
  // validateCollectionActionTypes(config.collectionActionTypes);
  // validateCollectionWaitingTypes(config.collectionWaitingTypes);
  /** ________________________ */

  return config;
}

export { getConfiguration };
