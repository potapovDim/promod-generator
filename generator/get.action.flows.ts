/* eslint-disable sonarjs/no-nested-template-literals */
import { camelize } from './utils';
import { getConfiguration } from './config';
import { getElementsTypes, createTypeForFragment } from './get.instance.elements.type';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

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

function getActionFlows(asActorAndPage, pageName, pageInstance, action) {
  const { actionToTypeMap, resultActionsMap, actionWithWaitOpts, systemPropsList, ...baseElementActions } =
    getConfiguration();

  const pageFields = Object.getOwnPropertyNames(pageInstance);
  const interactionFields = pageFields.filter(item => !systemPropsList.has(item));

  const pageElementActions = interactionFields.filter(fragmentFieldName =>
    baseElementActions[`baseElementsWith${action}Action`].has(pageInstance[fragmentFieldName].constructor.name),
  );

  const pageFragmentsActions = interactionFields.filter(fragmentFieldName =>
    checkThatFragmentHasItemsToAction(
      pageInstance[fragmentFieldName],
      baseElementActions[`baseElementsWith${action}Action`],
    ),
  );

  const pageElementAction = pageElementActions.length
    ? `
type T${camelize(`${pageName} visibility`)} = ${getElementsTypes(pageInstance, 'Visibility')}
const ${camelize(`${asActorAndPage} ${action} PageElements`)} = async function(data: T${camelize(
        `${pageName} ${action}`,
      )}${actionWithWaitOpts.has(action) ? ', opts?: IWaitOpts' : ''}) {
	return await page.${action}(data, opts);
};\n`
    : '';

  return `
/** ====================== ${action} ================== */
${pageFragmentsActions.reduce(
  (template, fragmentFieldName) =>
    `${template}\n${createFlowTemplates(
      camelize(`${asActorAndPage} wait visibility for ${pageInstance[fragmentFieldName].identifier}`),
      'waitForVisibilityState',
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
