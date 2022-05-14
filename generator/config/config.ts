/* eslint-disable sonarjs/cognitive-complexity, sonarjs/prefer-immediate-return*/
import * as path from 'path';
import * as fs from 'fs';

import { validateBaseLibraryDescription } from './validator';

const expectedConfigPath = path.resolve(process.cwd(), './promod.generator.config.js');

function getConfiguration() {
  if (!fs.existsSync(expectedConfigPath)) {
    throw new Error(`${expectedConfigPath} does not exist`);
  }

  // eslint-disable-next-line
  const config = require(expectedConfigPath);
  /** @info validation section */
  validateBaseLibraryDescription(config.baseLibraryDescription);
  /** ________________________ */

  return config;
}

export { getConfiguration };
