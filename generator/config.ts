/* eslint-disable sonarjs/cognitive-complexity */
import * as path from 'path';
import * as fs from 'fs';
import { isSet, isArray, isString, isObject } from 'sat-utils';

const expectedConfigPath = path.resolve(process.cwd(), './promod.generator.js');

import {
  allBaseElements,
  sendKeysElement,
  clickElements,
  systemProps,
  pathToLibrary,
  baseActionToTypeMap,
  baseResultActionTypeMap,
  actionWaitOpts,
  baseActions,
} from './base';

function getConfiguration() {
  const config = fs.existsSync(expectedConfigPath) ? require(expectedConfigPath) : {};

  let {
    baseElementsList = allBaseElements,
    baseElementsWithSendKeysAction = sendKeysElement,
    baseElementsWithClickAction = clickElements,

    systemPropsList = systemProps,
    pathToBase = pathToLibrary,
    actionToTypeMap = baseActionToTypeMap,
    resultActionsMap = baseResultActionTypeMap,
    actionWithWaitOpts = actionWaitOpts,
    actions = baseActions,
  } = config;

  if (!isSet(baseElementsList) && !isArray(baseElementsList)) {
    throw new TypeError(`'baseElementsList' should be array or set`);
  }

  if (!isSet(baseElementsWithSendKeysAction) && !isArray(baseElementsWithSendKeysAction)) {
    throw new TypeError(`'baseElementsWithSendKeysAction' should be array or set`);
  }

  if (!isSet(baseElementsWithClickAction) && !isArray(baseElementsWithClickAction)) {
    throw new TypeError(`'baseElementsWithClickAction' should be array or set`);
  }

  if (!isSet(systemPropsList) && !isArray(systemPropsList)) {
    throw new TypeError(`'systemPropsList' should be array or set`);
  }

  if (!isSet(actionWithWaitOpts) && !isArray(actionWithWaitOpts)) {
    throw new TypeError(`'actionWithWaitOpts' should be array or set`);
  }

  if (!isString(pathToBase)) {
    throw new TypeError(`'pathToBase' should be string`);
  }

  if (!isObject(actionToTypeMap)) {
    throw new TypeError(`'actionToTypeMap' should be object`);
  }

  if (!isObject(resultActionsMap)) {
    throw new TypeError(`'resultActionsMap' should be object`);
  }

  return {
    baseElementsList: isSet(baseElementsList) ? baseElementsList : new Set(baseElementsList),
    baseElementsWithSendKeysAction: isSet(baseElementsWithSendKeysAction)
      ? baseElementsWithSendKeysAction
      : new Set(baseElementsWithSendKeysAction),
    baseElementsWithClickAction: isSet(baseElementsWithClickAction)
      ? baseElementsWithClickAction
      : new Set(baseElementsWithClickAction),

    systemPropsList: isSet(systemPropsList) ? systemPropsList : new Set(systemPropsList),

    pathToBase,
    actionToTypeMap,
    resultActionsMap,
    actionWithWaitOpts: isSet(actionWithWaitOpts) ? actionWithWaitOpts : new Set(actionWithWaitOpts),
    actions,
  };
}

export { getConfiguration };
