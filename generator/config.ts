import * as path from 'path';
import * as fs from 'fs';

const expectedConfigPath = path.resolve(process.cwd(), './promod.generator.js');

import {
  allBaseElements,
  sendKeysElement,
  clickElements,
  systemProps,
  pathToLibrary,
  baseActionToTypeMap,
  baseResultActionTypeMap,
} from './base';

function getConfiguration() {
  const config = fs.existsSync(expectedConfigPath) ? require(expectedConfigPath) : {};

  const {
    baseElementsList = allBaseElements,
    baseElementsWithSendKeysAction = sendKeysElement,
    baseElementsWithClickAction = clickElements,
    systemPropsList = systemProps,
    pathToBase = pathToLibrary,
    actionToTypeMap = baseActionToTypeMap,
    resultActionsMap = baseResultActionTypeMap,
  } = config;

  return {
    baseElementsList,
    baseElementsWithSendKeysAction,
    baseElementsWithClickAction,
    actionToTypeMap,
    resultActionsMap,
    systemPropsList,
    pathToBase,
  };
}

export { getConfiguration };
