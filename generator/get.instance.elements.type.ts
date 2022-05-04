/* eslint-disable unicorn/prefer-switch, no-use-before-define, sonarjs/no-identical-functions, sonarjs/cognitive-complexity */
import { createType } from './create.type';
import { getConfiguration } from './config';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

function getCollectionTypes(instance, action, actionElements) {
  const { baseElementsList, sendKeysElements } = getConfiguration();

  const collectionsItem = new instance.InstanceType(
    instance.rootLocator,
    instance.identifier,
    instance.rootElements.get(0),
  );

  const getTypeHandler = baseElementsList.has(collectionsItem.constructor.name)
    ? getElementType
    : createTypeForFragment;

  const types = {};
  if (action === 'SendKeys' && !checkThatFragmentHasItemsToAction(collectionsItem, sendKeysElements)) {
    return createType(types, action);
  }

  if (action === 'Action' || action === 'SendKeys') {
    types[action] = `ICollectionAction<${getTypeHandler(collectionsItem, 'GetRes', actionElements)}, ${getTypeHandler(
      collectionsItem,
      action,
      actionElements,
    )}>`;
  } else if (action === 'GetRes' || action === 'IsDispRes') {
    types[action] = `${getTypeHandler(collectionsItem, action, actionElements)}[]`;
  } else if (action === 'Visibility' || action === 'Content') {
    const proxyAction = action === 'Visibility' ? 'IsDispRes' : 'GetRes';
    types[action] = `ICollectionCheck<
    ${getTypeHandler(collectionsItem, 'GetRes', actionElements)},
    ${getTypeHandler(collectionsItem, 'Action', actionElements)},
    ${getTypeHandler(collectionsItem, proxyAction, actionElements)}
  > | ${getTypeHandler(collectionsItem, proxyAction, actionElements)} | ${getTypeHandler(
      collectionsItem,
      proxyAction,
      actionElements,
    )}[]`;
  }

  return createType(types, action);
}

function createTypeForFragment(del, action = 'Action', actionElements) {
  const { baseElementsList, sendKeysElements, systemPropsList } = getConfiguration();
  if (action === 'void') {
    return action;
  }

  if (del.constructor.name === 'Collection') {
    return getCollectionTypes(del, action, actionElements);
  }

  const instanceOwnKeys = Object.getOwnPropertyNames(del).filter(key => !systemPropsList.has(key));

  const fragmentElements = instanceOwnKeys
    .filter(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      return baseElementsList.has(prop);
    })
    .map(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      const isSendKeys = sendKeysElements.has(prop);

      const types = {
        [itemFiledName]: {
          Action: `${prop}Action`,
          GetRes: `${prop}GetRes`,
          IsDispRes: `${prop}IsDispRes`,
          Visibility: `${prop}IsDispRes`,
          Content: `${prop}GetRes`,
        },
      };

      if (isSendKeys) {
        // @ts-ignore
        types[itemFiledName].SendKeys = `${prop}SendKeys`;
      }

      return types;
    });

  const fragmentFragments = instanceOwnKeys
    .filter(itemFiledName => del[itemFiledName].constructor.name.includes('Fragment'))
    .map(itemFiledName => {
      const types = { [itemFiledName]: {} };
      if (action === 'SendKeys' && !checkThatFragmentHasItemsToAction(del[itemFiledName], sendKeysElements)) {
        return types;
      } else {
        types[itemFiledName][action] = createTypeForFragment(del[itemFiledName], action, actionElements);
      }

      return types;
    });
  const fragmentArrayFragments = instanceOwnKeys
    .filter(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      return prop === 'Collection';
    })
    .filter(itemFiledName => del[itemFiledName].InstanceType.name.includes('Fragment'))
    .map(itemFiledName => {
      const collectionsItem = new del[itemFiledName].InstanceType(
        del[itemFiledName].rootLocator,
        del[itemFiledName].identifier,
        del[itemFiledName].rootElements.get(0),
      );
      const types = { [itemFiledName]: {} };

      if (action === 'Action') {
        types[itemFiledName][action] = `ICollectionAction<${createTypeForFragment(
          collectionsItem,
          'GetRes',
          actionElements,
        )}, ${createTypeForFragment(collectionsItem, 'Action', actionElements)}>`;
      } else if (action === 'GetRes' || action === 'IsDispRes') {
        types[itemFiledName][action] = `${createTypeForFragment(collectionsItem, 'action', actionElements)}[]`;
      } else if (action === 'Visibility' || action === 'Content') {
        const proxyAction = action === 'Visibility' ? 'IsDispRes' : 'GetRes';
        types[itemFiledName][action] = `ICollectionCheck<
        ${createTypeForFragment(collectionsItem, 'GetRes', actionElements)},
        ${createTypeForFragment(collectionsItem, 'Action', actionElements)},
        ${createTypeForFragment(collectionsItem, proxyAction, actionElements)}
      > | ${createTypeForFragment(collectionsItem, proxyAction, actionElements)} | ${createTypeForFragment(
          collectionsItem,
          proxyAction,
          actionElements,
        )}[]`;
      }

      if (action === 'SendKeys' && checkThatFragmentHasItemsToAction(collectionsItem, sendKeysElements)) {
        // @ts-ignore
        types[itemFiledName].SendKeys = `ICollectionAction<${createTypeForFragment(
          collectionsItem,
          'GetRes',
          actionElements,
        )}, ${createTypeForFragment(collectionsItem, 'SendKeys', actionElements)}>`;
      }

      return types;
    });

  const fragmentArrayElements = instanceOwnKeys
    .filter(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      return prop === 'Collection';
    })
    .filter(itemFiledName => {
      const prop = del[itemFiledName].InstanceType.prototype.constructor.name;

      return baseElementsList.has(prop);
    })
    .map(itemFiledName => {
      const prop = del[itemFiledName].InstanceType.prototype.constructor.name;
      const isSendKeys = sendKeysElements.has(prop);
      const types = {
        [itemFiledName]: {
          Action: `ICollectionAction<${prop}GetRes, ${prop}Action>`,
          GetRes: `${prop}GetRes[]`,
          IsDispRes: `${prop}IsDispRes[]`,
          Visibility: `ICollectionCheck<${prop}GetRes, ${prop}Action, ${prop}IsDispRes> | ${prop}IsDispRes | ${prop}IsDispRes[]`,
          Content: `ICollectionCheck<${prop}GetRes, ${prop}Action, ${prop}GetRes> | ${prop}GetRes | ${prop}GetRes[]`,
        },
      };

      if (isSendKeys) {
        // @ts-ignore
        types[itemFiledName].SendKeys = `ICollectionAction<${prop}GetRes, ${prop}SendKeys>`;
      }

      return types;
    });

  return createType(
    [...fragmentElements, ...fragmentArrayElements, ...fragmentFragments, ...fragmentArrayFragments],
    action,
  );
}

function getElementsTypes(instance, expectedType, actionElements: Set<string>) {
  if (expectedType === 'void') return expectedType;

  const instanceElements = Object.getOwnPropertyNames(instance)
    .filter(itemFiledName => {
      const prop = instance[itemFiledName]?.constructor?.name;

      return actionElements.has(prop);
    })
    .map(itemFiledName => ({ [itemFiledName]: getElementType(instance[itemFiledName], expectedType, actionElements) }));

  return createType(Array.from(instanceElements), expectedType);
}

function getElementType(instance, expectedType, actionElements: Set<string>) {
  const prop = instance.constructor.name;

  const isSendKeys = actionElements.has(prop);

  const types: any = {
    Action: `${prop}Action`,
    GetRes: `${prop}GetRes`,
    IsDispRes: `${prop}IsDispRes`,
    Visibility: `${prop}IsDispRes`,
    Content: `${prop}GetRes`,
  };

  if (isSendKeys) {
    types.SendKeys = `${prop}SendKeys`;
  }
  if (expectedType) {
    return types[expectedType];
  }

  return types;
}

export { getElementsTypes, getCollectionTypes, createTypeForFragment };
