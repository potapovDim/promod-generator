/* eslint-disable max-statements, complexity, max-len, unicorn/prefer-set-has, sonarjs/no-nested-template-literals*/
import * as path from 'path';
import * as fs from 'fs';

import { getElementsTypes, createTypeForFragment } from './get.instance.elements.type';
import { sendKeysElement, systemProps, clickElements } from './base';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';
import { getBaseImport } from './get.base.import';
import { findAllBaseElements } from './get.base.elements';
import { getConfiguration } from './config';
import { camelize } from './utils';

const flowMatcher = /(?<=const ).*(?= = async)/gim;

const createFlowTemplates = (name, action, field, instance) => {
  const { actionToTypeMap, resultActionsMap, actionWithWaitOpts } = getConfiguration();

  const flowArgumentType = createTypeForFragment(instance, actionToTypeMap[action]);
  const flowResultType =
    resultActionsMap[action] === 'void' ? 'void' : createTypeForFragment(instance, resultActionsMap[action]);

  return `type T${camelize(`${field}${action}`)} = ${flowArgumentType}
const ${name} = async function(data: T${camelize(`${field}${action}`)}${
    actionWithWaitOpts.includes(action) ? ', opts?: IWaitOpts' : ''
  }): Promise<${flowResultType}> {
  ${resultActionsMap[action] === 'void' ? 'return' : `const { ${field} } =`} await page.${action}({ ${field}: data }${
    actionWithWaitOpts.includes(action) ? ', opts' : ''
  });${resultActionsMap[action] === 'void' ? '' : `\n\n\treturn ${field};`}
};`;
};

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

  const pageFragments = Object.getOwnPropertyNames(pageInstance);

  const interactionFields = pageFragments.filter(item => !systemProps.has(item));

  const sendKeysFields = interactionFields
    .filter(fragmentFieldName => !sendKeysElement.has(pageInstance[fragmentFieldName].constructor.name))
    .filter(fragmentFieldName => checkThatFragmentHasItemsToAction(pageInstance[fragmentFieldName], sendKeysElement));

  const pageSendKeysElements = interactionFields.filter(fragmentFieldName =>
    sendKeysElement.has(pageInstance[fragmentFieldName].constructor.name),
  );

  const clickFields = interactionFields.filter(fragmentFieldName =>
    checkThatFragmentHasItemsToAction(pageInstance[fragmentFieldName], clickElements),
  );

  const visibilityContentGetisDisplayedFields = interactionFields.filter(fragmentFieldName =>
    checkThatFragmentHasItemsToAction(pageInstance[fragmentFieldName]),
  );

  const asActorAndPage = `on ${pageName}`;

  const clickInteractions = `
  /** ====================== click actions ================== */
  ${clickFields.reduce(
    (template, fragmentFieldName) =>
      `${template}\n${createFlowTemplates(
        camelize(`${asActorAndPage} click ${pageInstance[fragmentFieldName].identifier}Elements`),
        'click',
        fragmentFieldName,
        pageInstance[fragmentFieldName],
      )}\n`,
    `\n
  type T${camelize(`${pageName} click`)} = ${getElementsTypes(pageInstance, 'Action')}
  const ${camelize(`${asActorAndPage} click PageElements`)} = async function(data: T${camelize(`${pageName} click`)}) {
    return await page.click(data);
  };\n
  `,
  )}
  /** ====================== click actions ================== */
  `;

  const visibilityInteractions = `
  /** ====================== wait visibility actions ================== */
  ${visibilityContentGetisDisplayedFields.reduce(
    (template, fragmentFieldName) =>
      `${template}\n${createFlowTemplates(
        camelize(`${asActorAndPage} wait visibility for ${pageInstance[fragmentFieldName].identifier}`),
        'waitForVisibilityState',
        fragmentFieldName,
        pageInstance[fragmentFieldName],
      )}\n`,
    `\n
  type T${camelize(`${pageName} visibility`)} = ${getElementsTypes(pageInstance, 'Visibility')}
  const ${camelize(`${asActorAndPage} wait visibility for PageElements`)} = async function(data: T${camelize(
      `${pageName} visibility`,
    )}, opts?: IWaitOpts) {
    return await page.waitForVisibilityState(data, opts);
  };\n
  `,
  )}
  /** ====================== wait visibility ================== */
  `;

  const getInteractions = `
  /** ====================== get data ================== */
  ${visibilityContentGetisDisplayedFields.reduce(
    (template, fragmentFieldName) =>
      `${template}\n${createFlowTemplates(
        camelize(`${asActorAndPage} get data from ${pageInstance[fragmentFieldName].identifier}`),
        'get',
        fragmentFieldName,
        pageInstance[fragmentFieldName],
      )}\n`,
    `\n
  type T${camelize(`${pageName} getRes`)} = ${getElementsTypes(pageInstance, 'Action')}
  const ${camelize(`${asActorAndPage} get data from PageElements`)} = async function(data: T${camelize(
      `${pageName} getRes`,
    )}): Promise<${getElementsTypes(pageInstance, 'GetRes')}> {
    return await page.get(data);
  };\n
  `,
  )}
  /** ====================== get data ================== */
  `;

  const getVisibilityInteractions = `
  /** ====================== get visibility ================== */
  ${visibilityContentGetisDisplayedFields.reduce(
    (template, fragmentFieldName) =>
      `${template}\n${createFlowTemplates(
        camelize(`${asActorAndPage} get visibility from ${pageInstance[fragmentFieldName].identifier}`),
        'isDisplayed',
        fragmentFieldName,
        pageInstance[fragmentFieldName],
      )}\n`,
    `\n
  type T${camelize(`${pageName} isDispRes`)} = ${getElementsTypes(pageInstance, 'Action')}
  const ${camelize(`${asActorAndPage} get visibility from PageElements`)} = async function(data: T${camelize(
      `${pageName} isDispRes`,
    )}): Promise<${getElementsTypes(pageInstance, 'IsDispRes')}> {
    return await page.isDisplayed(data);
  };\n
  `,
  )}
  /** ====================== get visibility ================== */
  `;

  const contentInteractions = `
  /** ====================== wait content ================== */
  ${visibilityContentGetisDisplayedFields.reduce(
    (template, fragmentFieldName) =>
      `${template}\n${createFlowTemplates(
        camelize(`${asActorAndPage} wait content state for ${pageInstance[fragmentFieldName].identifier}`),
        'waitForContentState',
        fragmentFieldName,
        pageInstance[fragmentFieldName],
      )}\n`,
    `\n
  type T${camelize(`${pageName} Content`)} = ${getElementsTypes(pageInstance, 'Content')}
  const ${camelize(`${asActorAndPage} wait content state for PageElements`)} = async function(data: T${camelize(
      `${pageName} Content`,
    )}, opts?: IWaitOpts) {
    return await page.waitForContentState(data, opts);
  };\n
  `,
  )}
  /** ====================== wait content ================== */
  `;

  const pageSendKeysInteractions = pageSendKeysElements.length
    ? `\n
type T${camelize(`${pageName} SendKeys`)} = ${getElementsTypes(pageInstance, 'SendKeys')}
const ${camelize(`${asActorAndPage} sendKeys PageElements`)} = async function(data: T${camelize(
        `${pageName} SendKeys`,
      )}): Promise<void> {
  return await page.sendKeys(data);
};\n`
    : '';
  const sendKeysInteractions = `
/** ====================== send keys ================== */
${sendKeysFields.reduce(
  (template, fragmentFieldName) =>
    `${template}\n${createFlowTemplates(
      camelize(`${asActorAndPage} sendKeys to ${pageInstance[fragmentFieldName].identifier} Elements`),
      'sendKeys',
      fragmentFieldName,
      pageInstance[fragmentFieldName],
    )}\n`,
  `${pageSendKeysInteractions}`,
)}
/** ====================== send keys ================== */
  `;

  const interactionInterface = [
    sendKeysInteractions,
    contentInteractions,
    getVisibilityInteractions,
    getInteractions,
    visibilityInteractions,
    clickInteractions,
  ];

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
