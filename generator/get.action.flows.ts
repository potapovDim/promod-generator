/* eslint-disable sonarjs/no-nested-template-literals */
import { camelize } from 'sat-utils';
import { getConfiguration } from './config/config';
import { getElementsTypes, getFragmentTypes } from './get.instance.elements.type';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

function getTemplatedCode({ name, typeName, flowArgumentType, flowResultType, optionsSecondArgument, action, field }) {
  return `type ${typeName} = ${flowArgumentType}
  const ${name} = async function(data: ${typeName}${optionsSecondArgument}): Promise<${flowResultType}> {
    ${flowResultType === 'void' ? 'return' : `const { ${field} } =`} await page.${action}({ ${field}: data }${
    optionsSecondArgument ? ', opts' : ''
  });${flowResultType === 'void' ? '' : `\n\treturn ${field};`}
  };`;
}

function createFlowTemplates(name, action, field, instance) {
  const { actionWithWaitOpts, baseLibraryDescription } = getConfiguration();

  const flowArgumentType = getFragmentTypes(instance, action, 'entryType');
  const flowResultType = getFragmentTypes(instance, action, 'resultType');
  const typeName = `T${camelize(`${field} ${action}`)}`;

  const optionsSecondArgument = actionWithWaitOpts.includes(action)
    ? `, opts?: ${baseLibraryDescription.waitOptionsId}`
    : '';

  return getTemplatedCode({ name, typeName, flowArgumentType, flowResultType, optionsSecondArgument, action, field });
}

// TODO try to build generic method for page elements and page fragments
function createFlowTemplateForPageElements(name, action, instance) {
  const { actionWithWaitOpts, baseLibraryDescription, prettyMethodName = {} } = getConfiguration();

  const prettyFlowActionNamePart = prettyMethodName[action] || action;

  const flowArgumentType = getElementsTypes(instance, action, 'entryType');
  const flowResultType = getElementsTypes(instance, action, 'resultType');
  const typeName = `T${camelize(`${name} ${action}`)}`;

  const flowActionName = camelize(`${name} ${prettyFlowActionNamePart} PageElements`);

  const optionsSecondArgument = actionWithWaitOpts.includes(action)
    ? `, opts?: ${baseLibraryDescription.waitOptionsId}`
    : '';

  return `
type ${typeName} = ${flowArgumentType}
const ${flowActionName} = async function(data: ${typeName}${optionsSecondArgument}): Promise<${flowResultType}> {
  return await page.${action}(data${optionsSecondArgument ? ', opts' : ''});
};\n`;
}

function getActionFlows(asActorAndPage: string, pageInstance: object, action: string) {
  const { baseElementsActionsDescription, systemPropsList, prettyMethodName = {} } = getConfiguration();

  const pageFields = Object.getOwnPropertyNames(pageInstance);
  const interactionFields = pageFields.filter(field => !systemPropsList.includes(field));

  const pageElementActions = interactionFields.filter(
    field => baseElementsActionsDescription[pageInstance[field]?.constructor.name],
  );

  const pageFragmentsActions = interactionFields.filter(field =>
    checkThatFragmentHasItemsToAction(pageInstance[field], action),
  );

  const pageElementAction = pageElementActions.length
    ? createFlowTemplateForPageElements(
        camelize(`${asActorAndPage} ${prettyMethodName[action] ? prettyMethodName[action] : action} PageElements`),
        action,
        pageInstance,
      )
    : '';

  return `
/** ====================== ${action} ================== */
${pageFragmentsActions.reduce(
  (template, fragmentFieldName) => {
    const prettyFlowActionNamePart = prettyMethodName[action] || action;

    const name = camelize(
      `${asActorAndPage} ${prettyFlowActionNamePart} ${pageInstance[fragmentFieldName].identifier}`,
    );

    return `${template}\n${createFlowTemplates(name, action, fragmentFieldName, pageInstance[fragmentFieldName])}\n`;
  },
  `\n
`,
)}
${pageElementAction}
/** ====================== ${action} ================== */
`;
}

export { createFlowTemplates, getActionFlows };
