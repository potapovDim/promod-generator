/* eslint-disable unicorn/prefer-switch, no-use-before-define, sonarjs/cognitive-complexity */
import { createType } from './create.type';
import { getConfiguration } from './config';
import { checkThatFragmentHasItemsToAction, checkThatElementHasAction } from './check.that.action.exists';

function getCollectionTypes(instance, action, actionType) {
  const { resultActionsMap, baseElementsActionsDescription, collectionWaitingTypes, baseLibraryDescription } =
    getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  const collectionsItem = new instance[baseLibraryDescription.collectionItemId](
    instance[baseLibraryDescription.rootLocatorId],
    instance[baseLibraryDescription.entityId],
    instance.rootElements.get(0),
  );

  if (!checkThatFragmentHasItemsToAction(collectionsItem, action)) {
    return '';
  }

  const getTypeHandler = baseElementsActionsDescription[collectionsItem.constructor.name]
    ? getElementType
    : createTypeForFragment;

  const types = {};

  if (collectionWaitingTypes[action]) {
    const { where, action: proxyAction, compare } = collectionWaitingTypes[action];
    types[action] = `ICollectionCheck<
    ${getTypeHandler(collectionsItem, where, 'resultType')},
    ${getTypeHandler(collectionsItem, proxyAction, 'entryType')},
    ${getTypeHandler(collectionsItem, compare, 'resultType')}
  > | ${getTypeHandler(collectionsItem, where, 'resultType')} | ${getTypeHandler(
      collectionsItem,
      where,
      'resultType',
    )}[]`;
  } else {
    types[action] = `ICollectionAction<${getTypeHandler(collectionsItem, action, 'resultType')}, ${getTypeHandler(
      collectionsItem,
      action,
      'entryType',
    )}>`;
  }

  return createType(types, action);
}

function createTypeForFragment(instance, action, actionType) {
  const {
    resultActionsMap,
    systemPropsList,
    baseElementsActionsDescription,
    collectionWaitingTypes,
    baseLibraryDescription,
    collectionActionTypes,
  } = getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  if (instance.constructor.name === 'Collection') {
    return getCollectionTypes(instance, action, actionType);
  }

  const instanceOwnKeys = Object.getOwnPropertyNames(instance).filter(key => !systemPropsList.includes(key));
  // console.log(instanceOwnKeys);

  const fragmentElements = instanceOwnKeys
    .filter(itemFiledName => {
      const prop = instance[itemFiledName].constructor.name;

      return baseElementsActionsDescription[prop] && checkThatElementHasAction(prop, action);
    })
    .map(itemFiledName => ({
      [itemFiledName]: { [action]: getElementType(instance[itemFiledName], action, actionType) },
    }));

  const fragmentFragments = instanceOwnKeys
    .filter(itemFiledName => {
      return (
        instance[itemFiledName].constructor.name.includes(baseLibraryDescription.fragmentId) &&
        checkThatFragmentHasItemsToAction(instance[itemFiledName], action)
      );
    })
    .map(itemFiledName => ({
      [itemFiledName]: { [action]: createTypeForFragment(instance[itemFiledName], action, actionType) },
    }));

  const fragmentArrayFragments = instanceOwnKeys
    .filter(itemFiledName => instance[itemFiledName].constructor.name === baseLibraryDescription.collectionId)
    .filter(itemFiledName =>
      instance[itemFiledName][baseLibraryDescription.collectionItemId].name.includes(baseLibraryDescription.fragmentId),
    )
    .map(itemFiledName => {
      const collectionsItem = new instance[itemFiledName].InstanceType(
        instance[itemFiledName].identifier,
        instance[itemFiledName].rootLocator,
        instance[itemFiledName].rootElements.get(0),
      );
      const types = { [itemFiledName]: {} };

      if (!checkThatFragmentHasItemsToAction(collectionsItem, action)) {
        return types;
      }

      if (collectionWaitingTypes[action]) {
        const { where, action: proxyAction, compare } = collectionWaitingTypes[action];
        types[itemFiledName][action] = `ICollectionCheck<
        ${createTypeForFragment(collectionsItem, where, 'resultType')},
        ${createTypeForFragment(collectionsItem, proxyAction, 'entryType')},
        ${createTypeForFragment(collectionsItem, compare, 'resultType')}
      > | ${createTypeForFragment(collectionsItem, where, 'resultType')} | ${createTypeForFragment(
          collectionsItem,
          where,
          'resultType',
        )}[]`;
      } else {
        const { where, action: proxyAction } = collectionActionTypes[action];
        types[itemFiledName][action] = `ICollectionAction<${createTypeForFragment(
          collectionsItem,
          where,
          'resultType',
        )}, ${createTypeForFragment(collectionsItem, proxyAction, 'entryType')}>`;
      }

      return types;
    });

  const fragmentArrayElements = instanceOwnKeys
    .filter(itemFiledName => instance[itemFiledName].constructor.name === baseLibraryDescription.collectionId)
    .filter(itemFiledName => baseElementsActionsDescription[instance[itemFiledName].InstanceType.name])
    .map(itemFiledName => {
      const collectionsItem = new instance[itemFiledName].InstanceType(
        instance[itemFiledName].rootLocator,
        instance[itemFiledName].identifier,
        instance[itemFiledName].rootElements.get(0),
      );

      const types = { [itemFiledName]: {} };

      if (collectionWaitingTypes[action]) {
        const { where, action: proxyAction, compare } = collectionWaitingTypes[action];
        types[itemFiledName][action] = `ICollectionCheck<
        ${getElementType(collectionsItem, where, 'resultType')},
        ${getElementType(collectionsItem, proxyAction, 'entryType')},
        ${getElementType(collectionsItem, compare, 'resultType')}
      > | ${getElementType(collectionsItem, where, 'resultType')} | ${getElementType(
          collectionsItem,
          where,
          'resultType',
        )}[]`;
      } else {
        const { where, action: proxyAction } = collectionActionTypes[action];
        types[itemFiledName][action] = `ICollectionAction<${getElementType(
          collectionsItem,
          where,
          'resultType',
        )}, ${getElementType(collectionsItem, proxyAction, 'entryType')}>`;
      }

      return types;
    });

  return createType(
    [...fragmentElements, ...fragmentArrayElements, ...fragmentFragments, ...fragmentArrayFragments],
    action,
  );
}

function getElementsTypes(instance, action, actionType) {
  const { resultActionsMap, baseElementsActionsDescription } = getConfiguration();
  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  const instanceElements = Object.getOwnPropertyNames(instance)
    .filter(itemFiledName => baseElementsActionsDescription[instance[itemFiledName]?.constructor?.name])
    .map(itemFiledName => ({ [itemFiledName]: getElementActionType(instance[itemFiledName], action, actionType) }));

  return createType(Array.from(instanceElements), action);
}

function getElementActionType(instance, action: string, actionType: string) {
  const { baseElementsActionsDescription } = getConfiguration();
  const prop = instance.constructor.name;

  const types = {};
  if (baseElementsActionsDescription[prop][action] && baseElementsActionsDescription[prop][action][actionType]) {
    types[action] = `${prop}${baseElementsActionsDescription[prop][action][actionType]}`;
  }

  return types;
}

function getElementType(instance, action: string, actionType: string) {
  const { baseElementsActionsDescription } = getConfiguration();
  const prop = instance.constructor.name;

  if (baseElementsActionsDescription[prop][action] && baseElementsActionsDescription[prop][action][actionType]) {
    return `${prop}${baseElementsActionsDescription[prop][action][actionType]}`;
  }

  return '';
}

export { getElementsTypes, getCollectionTypes, createTypeForFragment };
