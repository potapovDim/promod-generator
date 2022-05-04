import * as path from 'path';
import * as fs from 'fs';

import { getBaseImport } from './get.base.import';
import { findAllBaseElements } from './get.base.elements';
import { getConfiguration } from './config';
import { getActionFlows } from './get.action.flows';
import { getAllBaseActions } from './utils';

const flowMatcher = /(?<=const ).*(?= = async)/gim;

const createPageStructure = (pagePath: string) => {
  const { pathToBase, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();
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

  const PageClass = Object.values(pageModule as { [k: string]: any }).find(exportedItem =>
    exportedItem.constructor.name.includes(baseLibraryDescription.pageId),
  );
  const pageInstance = new PageClass();

  const globalImport = `import {
  ${getBaseImport(findAllBaseElements(pageInstance))}
} from '${pathToLibFolder}${pathToBase}';`;

  const pageName = pageInstance.identifier;

  const asActorAndPage = `on ${pageName}`;

  const actions = getAllBaseActions(baseElementsActionsDescription);

  const interactionInterface = actions.map(pageAction =>
    getActionFlows(asActorAndPage, pageName, pageInstance, pageAction),
  );

  const body = `${globalImport}

import { ${PageClass.prototype.constructor.name} } from './${pageRelativeTsPath}';

const page = new ${PageClass.prototype.constructor.name}();
${interactionInterface.join('\n')}`;

  const flows = body.match(flowMatcher) || [];

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
