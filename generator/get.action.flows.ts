/* eslint-disable sonarjs/no-nested-template-literals */
import { camelize } from './utils';
import { getConfiguration } from './config';
import { getElementsTypes, createTypeForFragment } from './get.instance.elements.type';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

function createFlowTemplates(name, action, field, instance) {
  const { actionWithWaitOpts } = getConfiguration();

  const flowArgumentType = createTypeForFragment(instance, action, 'entryType');
  const flowResultType = createTypeForFragment(instance, action, 'resultType');

  return `type T${camelize(`${field}${action}`)} = ${flowArgumentType}
const ${name} = async function(data: T${camelize(`${field}${action}`)}${
    // TODO should be update
    actionWithWaitOpts.includes(action) ? ', opts?: IWaitOpts' : ''
  }): Promise<${flowResultType}> {
  ${flowResultType === 'void' ? 'return' : `const { ${field} } =`} await page.${action}({ ${field}: data }${
    actionWithWaitOpts.includes(action) ? ', opts' : ''
  });${flowResultType === 'void' ? '' : `\n\n\treturn ${field};`}
};`;
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

  const flowTypeName = camelize(`T ${pageName} ${action}`);
  // TODO should be update
  const optionsSecondArgument = actionWithWaitOpts.includes(action) ? ', opts?: IWaitOpts' : '';

  const pageElementAction = pageElementActions.length
    ? `
type ${flowTypeName} = ${getElementsTypes(pageInstance, action, 'entryType')}
const ${flowActionName} = async function(data: ${flowTypeName}${optionsSecondArgument}): Promise<${getElementsTypes(
        pageInstance,
        action,
        'resultType',
      )}> {
	return await page.${action}(data, opts);
};\n`
    : '';

  return `
/** ====================== ${action} ================== */
${pageFragmentsActions.reduce(
  (template, fragmentFieldName) =>
    `${template}\n${createFlowTemplates(
      camelize(
        `${asActorAndPage} ${prettyMethodName[action] ? prettyMethodName[action] : action} ${
          pageInstance[fragmentFieldName].identifier
        }`,
      ),
      action,
      fragmentFieldName,
      pageInstance[fragmentFieldName],
    )}\n`,
  `\n
`,
)}
${pageElementAction}
/** ====================== ${action} ================== */
`;
}

export { createFlowTemplates, getActionFlows };
