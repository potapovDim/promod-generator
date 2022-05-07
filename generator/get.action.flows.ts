/* eslint-disable sonarjs/no-nested-template-literals */
import { camelize } from './utils';
import { getConfiguration } from './config';
import { getElementsTypes, createTypeForFragment } from './get.instance.elements.type';
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

  const flowArgumentType = createTypeForFragment(instance, action, 'entryType');
  const flowResultType = createTypeForFragment(instance, action, 'resultType');
  const typeName = camelize(`T${field}${action}`);

  const optionsSecondArgument = actionWithWaitOpts.includes(action)
    ? `, opts?: ${baseLibraryDescription.waitOptionsId}`
    : '';

  return getTemplatedCode({ name, typeName, flowArgumentType, flowResultType, optionsSecondArgument, action, field });
}

// TODO try to build generic method for page elements and page fragments
function createFlowTemplateForPageElements(name, action, field, instance) {
  const { actionWithWaitOpts, baseLibraryDescription, prettyMethodName = {} } = getConfiguration();

  const prettyFlowActionNamePart = prettyMethodName[action] || action;

  const flowArgumentType = getElementsTypes(instance, action, 'entryType');
  const flowResultType = getElementsTypes(instance, action, 'resultType');
  const typeName = camelize(`T ${name} ${action}`);

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

function getActionFlows(asActorAndPage, pageName, pageInstance, action) {
  const {
    baseElementsActionsDescription,
    actionWithWaitOpts,
    systemPropsList,
    prettyMethodName = {},
  } = getConfiguration();

  const pageFields = Object.getOwnPropertyNames(pageInstance);
  const interactionFields = pageFields.filter(field => !systemPropsList.includes(field));

  const pageElementActions = interactionFields.filter(
    field => baseElementsActionsDescription[pageInstance[field]?.constructor.name],
  );

  const pageFragmentsActions = interactionFields.filter(field =>
    checkThatFragmentHasItemsToAction(pageInstance[field], action),
  );

  const flowActionName = camelize(
    // TODO should be update
    `${asActorAndPage} ${prettyMethodName[action] ? prettyMethodName[action] : action} PageElements`,
  );

  const pageElementAction = pageElementActions.length
    ? createFlowTemplateForPageElements(flowActionName, action, null, pageInstance)
    : '';

  return `
/** ====================== ${action} ================== */
${pageFragmentsActions.reduce(
  (template, fragmentFieldName) => {
    const name = camelize(
      `${asActorAndPage} ${prettyMethodName[action] ? prettyMethodName[action] : action} ${
        pageInstance[fragmentFieldName].identifier
      }`,
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
