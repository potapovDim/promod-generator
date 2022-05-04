/* eslint-disable sonarjs/no-nested-template-literals */
import { camelize } from './utils';
import { getConfiguration } from './config';
import { getElementsTypes, createTypeForFragment } from './get.instance.elements.type';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

const createFlowTemplates = (name, action, field, instance, argumentType, resultType) => {
  const { actionWithWaitOpts, ...restConfig } = getConfiguration();

  const flowArgumentType = createTypeForFragment(instance, argumentType, restConfig[`${action}Elements`]);
  const flowResultType = createTypeForFragment(instance, resultType, restConfig[`${action}Elements`]);

  return `type T${camelize(`${field}${action}`)} = ${flowArgumentType}
const ${name} = async function(data: T${camelize(`${field}${action}`)}${
    actionWithWaitOpts.has(action) ? ', opts?: IWaitOpts' : ''
  }): Promise<${flowResultType}> {
  ${flowResultType === 'void' ? 'return' : `const { ${field} } =`} await page.${action}({ ${field}: data }${
    actionWithWaitOpts.has(action) ? ', opts' : ''
  });${flowResultType === 'void' ? '' : `\n\n\treturn ${field};`}
};`;
};

function getActionFlows(asActorAndPage, pageName, pageInstance, action, argumentType, resultType) {
  const { actionToTypeMap, resultActionsMap, actionWithWaitOpts, systemPropsList, ...resetConfig } = getConfiguration();

  const pageFields = Object.getOwnPropertyNames(pageInstance);
  const interactionFields = pageFields.filter(item => !systemPropsList.has(item));

  const pageElementActions = interactionFields.filter(fragmentFieldName => {
    return resetConfig[`${action}Elements`].has(pageInstance[fragmentFieldName].constructor.name);
  });

  const pageFragmentsActions = interactionFields.filter(fragmentFieldName =>
    checkThatFragmentHasItemsToAction(pageInstance[fragmentFieldName], resetConfig[`${action}Elements`]),
  );

  const pageElementAction = pageElementActions.length
    ? `
type T${camelize(`${pageName} ${action}`)} = ${getElementsTypes(
        pageInstance,
        argumentType,
        resetConfig[`${action}Elements`],
      )}
const ${camelize(`${asActorAndPage} ${action} PageElements`)} = async function(data: T${camelize(
        `${pageName} ${action}`,
      )}${actionWithWaitOpts.has(action) ? ', opts?: IWaitOpts' : ''}): Promise<${getElementsTypes(
        pageInstance,
        resultType,
        resetConfig[`${action}Elements`],
      )}> {
	return await page.${action}(data, opts);
};\n`
    : '';

  return `
/** ====================== ${action} ================== */
${pageFragmentsActions.reduce(
  (template, fragmentFieldName) =>
    `${template}\n${createFlowTemplates(
      camelize(`${asActorAndPage} ${action} ${pageInstance[fragmentFieldName].identifier}`),
      action,
      fragmentFieldName,
      pageInstance[fragmentFieldName],
      argumentType,
      resultType,
    )}\n`,
  `\n
`,
)}
${pageElementAction}
/** ====================== ${action} ================== */
`;
}

export { createFlowTemplates, getActionFlows };
