/* eslint-disable max-statements, complexity, max-len, unicorn/prefer-set-has, sonarjs/no-nested-template-literals*/
import * as path from 'path';
import * as fs from 'fs';

import { getBaseImport } from './get.base.import';
import { findAllBaseElements } from './get.base.elements';
import { getConfiguration } from './config';
import { getActionFlows } from './get.action.flows';

import { baseActionToTypeMap } from './base';

const flowMatcher = /(?<=const ).*(?= = async)/gim;

const createPageStructure = (pagePath: string) => {
  const { pathToBase } = getConfiguration();
  const frameworkPath = process.cwd();
  const pageRelativePath = path.basename(pagePath);
  const pageRelativeTsPath = pageRelativePath.replace('.ts', '');
  const pathToLibFolder = pagePath
    .replace(frameworkPath, '')
    .replace(pageRelativePath, '')
    .split('/')
    .splice(2)
    .map(() => '../')
    .join('');

  const pageModule = require(pagePath);

  // @ts-ignore
  const PageClass = Object.values(pageModule as { [k: string]: any })[0];
  const pageInstance = new PageClass();

  const globalImport = `import {
  ${getBaseImport(findAllBaseElements(pageInstance))}
} from '${pathToLibFolder}${pathToBase}';`;

  const pageName = pageInstance.identifier;

  const asActorAndPage = `on ${pageName}`;

  const requiredActionsList = Object.keys(baseActionToTypeMap);

  const interactionInterface = requiredActionsList.map(pageAction => {
    getActionFlows(asActorAndPage, pageName, pageInstance, baseActionToTypeMap[pageAction]);
  });

  const body = `${globalImport}

import { ${PageClass.prototype.constructor.name} } from './${pageRelativeTsPath}';

const page = new ${PageClass.prototype.constructor.name}();
${interactionInterface.join('\n')}`;

  const flows = body.match(flowMatcher);

  fs.writeFileSync(
    `${pagePath.replace('.ts', '.actions.ts')}`,
    `${body}

export {
  ${flows.join(',\n  ')},
};
`,
  );
};

export { createPageStructure };
