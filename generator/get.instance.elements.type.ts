/* eslint-disable unicorn/prefer-switch, no-use-before-define, sonarjs/no-identical-functions, sonarjs/cognitive-complexity */
import { createType } from './create.type';
import { allBaseElements, sendKeysElement, systemProps } from './base';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

function getCollectionTypes(instance, action) {
  const collectionsItem = new instance.InstanceType(
    instance.rootLocator,
    instance.identifier,
    instance.rootElements.get(0),
  );

  const getTypeHandler = allBaseElements.has(collectionsItem.constructor.name) ? getElementType : createTypeForFragment;

  const types = {};
  if (action === 'SendKeys' && !checkThatFragmentHasItemsToAction(collectionsItem, sendKeysElement)) {
    return createType(types, action);
  }

  if (action === 'Action' || action === 'SendKeys') {
    types[action] = `ICollectionAction<${getTypeHandler(collectionsItem, 'GetRes')}, ${getTypeHandler(
      collectionsItem,
      action,
    )}>`;
  } else if (action === 'GetRes' || action === 'IsDispRes') {
    types[action] = `${getTypeHandler(collectionsItem, action)}[]`;
  } else if (action === 'Visibility' || action === 'Content') {
    const proxyAction = action === 'Visibility' ? 'IsDispRes' : 'GetRes';
    types[action] = `ICollectionCheck<
    ${getTypeHandler(collectionsItem, 'GetRes')},
    ${getTypeHandler(collectionsItem, 'Action')},
    ${getTypeHandler(collectionsItem, proxyAction)}
  > | ${getTypeHandler(collectionsItem, proxyAction)} | ${getTypeHandler(collectionsItem, proxyAction)}[]`;
  }

  return createType(types, action);
}

function createTypeForFragment(del, action = 'Action') {
  if (del.constructor.name === 'Collection') {
    return getCollectionTypes(del, action);
  }

  const instanceOwnKeys = Object.getOwnPropertyNames(del).filter(key => !systemProps.has(key));

  const fragmentElements = instanceOwnKeys
    .filter(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      return allBaseElements.has(prop);
    })
    .map(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      const isSendKeys = sendKeysElement.has(prop);

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
      if (action === 'SendKeys' && !checkThatFragmentHasItemsToAction(del[itemFiledName], sendKeysElement)) {
        return types;
      } else {
        types[itemFiledName][action] = createTypeForFragment(del[itemFiledName], action);
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
        )}, ${createTypeForFragment(collectionsItem, 'Action')}>`;
      } else if (action === 'GetRes' || action === 'IsDispRes') {
        types[itemFiledName][action] = `${createTypeForFragment(collectionsItem, 'action')}[]`;
      } else if (action === 'Visibility' || action === 'Content') {
        const proxyAction = action === 'Visibility' ? 'IsDispRes' : 'GetRes';
        types[itemFiledName][action] = `ICollectionCheck<
        ${createTypeForFragment(collectionsItem, 'GetRes')},
        ${createTypeForFragment(collectionsItem, 'Action')},
        ${createTypeForFragment(collectionsItem, proxyAction)}
      > | ${createTypeForFragment(collectionsItem, proxyAction)} | ${createTypeForFragment(
          collectionsItem,
          proxyAction,
        )}[]`;
      }

      if (action === 'SendKeys' && checkThatFragmentHasItemsToAction(collectionsItem, sendKeysElement)) {
        // @ts-ignore
        types[itemFiledName].SendKeys = `ICollectionAction<${createTypeForFragment(
          collectionsItem,
          'GetRes',
        )}, ${createTypeForFragment(collectionsItem, 'SendKeys')}>`;
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

      return allBaseElements.has(prop);
    })
    .map(itemFiledName => {
      const prop = del[itemFiledName].InstanceType.prototype.constructor.name;
      const isSendKeys = sendKeysElement.has(prop);
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

function getElementsTypes(instance, action) {
  const instanceElements = Object.getOwnPropertyNames(instance)
    .filter(itemFiledName => {
      const prop = instance[itemFiledName]?.constructor?.name;

      return allBaseElements.has(prop);
    })
    .map(itemFiledName => ({ [itemFiledName]: getElementType(instance[itemFiledName]) }));

  return createType(Array.from(instanceElements), action);
}

function getElementType(instance, action?) {
  const prop = instance.constructor.name;

  const isSendKeys = sendKeysElement.has(prop);

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
  if (action) {
    return types[action];
  }

  return types;
}

export { getElementsTypes, getCollectionTypes, createTypeForFragment };
