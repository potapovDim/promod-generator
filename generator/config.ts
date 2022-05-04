/* eslint-disable sonarjs/cognitive-complexity */
import * as path from 'path';
import * as fs from 'fs';
import { isSet, isArray, isString, isObject } from 'sat-utils';

const expectedConfigPath = path.resolve(process.cwd(), './promod.generator.config.js');

function getConfiguration() {
  const config = fs.existsSync(expectedConfigPath) ? require(expectedConfigPath) : {};

  let {
    baseElementsList,
    actionWithWaitOpts,
    systemPropsList,
    pathToBase,
    actionToTypeMap,
    resultActionsMap,

    baseElementActions,
    ...elementsActions
  } = config;

  Object.keys(actionToTypeMap).forEach(action => {
    if (!isSet(elementsActions[`${action}Elements`]) && !isArray(elementsActions[`${action}Elements`])) {
      throw new TypeError(`'${action}Elements' should be array or set`);
    }
    if (isArray(elementsActions[`${action}Elements`])) {
      elementsActions[`${action}Elements`] = new Set(elementsActions[`${action}Elements`]);
    }
  });

  if (!isSet(baseElementsList) && !isArray(baseElementsList)) {
    throw new TypeError(`'baseElementsList' should be array or set`);
  } else if (isArray(baseElementsList)) {
    baseElementsList = new Set(baseElementsList);
  }

  if (!isSet(systemPropsList) && !isArray(systemPropsList)) {
    throw new TypeError(`'systemPropsList' should be array or set`);
  } else if (isArray(systemPropsList)) {
    systemPropsList = new Set(systemPropsList);
  }

  if (!isSet(actionWithWaitOpts) && !isArray(actionWithWaitOpts)) {
    throw new TypeError(`'actionWithWaitOpts' should be array or set`);
  } else if (isArray(actionWithWaitOpts)) {
    actionWithWaitOpts = new Set(actionWithWaitOpts);
  }

  if (!isString(pathToBase)) {
    throw new TypeError(`'pathToBase' should be string`);
  }


  if (!isObject(resultActionsMap)) {
    throw new TypeError(`'resultActionsMap' should be object`);
  }

  return {
    baseElementsList,
    actionWithWaitOpts,
    systemPropsList,
    pathToBase,
    resultActionsMap,

    baseElementActions,
    ...elementsActions,
  };
}

export { getConfiguration };
