/* eslint-disable unicorn/prefer-switch, no-use-before-define, sonarjs/cognitive-complexity */
import { createType } from './create.type';
import { getConfiguration } from './config';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';

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

function createTypeForFragment(del, action, actionType) {
  const {
    resultActionsMap,
    systemPropsList,
    baseElementsActionsDescription,
    collectionWaitingTypes,
    baseLibraryDescription,
    collectionActionTypes,
  } = getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  if (del.constructor.name === 'Collection') {
    return getCollectionTypes(del, action, actionType);
  }

  const instanceOwnKeys = Object.getOwnPropertyNames(del).filter(key => !systemPropsList.includes(key));

  const fragmentElements = instanceOwnKeys
    .filter(itemFiledName => {
      const prop = del[itemFiledName].constructor.name;

      return baseElementsActionsDescription[prop];
    })
    .map(itemFiledName => ({ [itemFiledName]: getElementType(del[itemFiledName], action, actionType) }));

  const fragmentFragments = instanceOwnKeys
    .filter(itemFiledName => del[itemFiledName].constructor.name.includes(baseLibraryDescription.fragmentId))
    .map(itemFiledName => {
      const types = {};

      if (checkThatFragmentHasItemsToAction(del[itemFiledName], action)) {
        types[itemFiledName][action] = createTypeForFragment(del[itemFiledName], action, actionType);
      }

      return types;
    });

  const fragmentArrayFragments = instanceOwnKeys
    .filter(itemFiledName => del[itemFiledName].constructor.name === baseLibraryDescription.collectionId)
    .filter(itemFiledName =>
      del[itemFiledName][baseLibraryDescription.collectionItemId].name.includes(baseLibraryDescription.fragmentId),
    )
    .map(itemFiledName => {
      const collectionsItem = new del[itemFiledName].InstanceType(
        del[itemFiledName].rootLocator,
        del[itemFiledName].identifier,
        del[itemFiledName].rootElements.get(0),
      );
      const types = {};

      if (!checkThatFragmentHasItemsToAction(collectionsItem, action)) {
        return types;
      }

      if (collectionWaitingTypes[action]) {
        const { where, action: proxyAction, compare } = collectionWaitingTypes[action];
        types[itemFiledName] = {
          [action]: `ICollectionCheck<
        ${createTypeForFragment(collectionsItem, where, 'resultType')},
        ${createTypeForFragment(collectionsItem, proxyAction, 'entryType')},
        ${createTypeForFragment(collectionsItem, compare, 'resultType')}
      > | ${createTypeForFragment(collectionsItem, where, 'resultType')} | ${createTypeForFragment(
            collectionsItem,
            where,
            'resultType',
          )}[]`,
        };
      } else {
        const { where, action: proxyAction } = collectionActionTypes[action];
        types[itemFiledName] = {
          [action]: `ICollectionAction<${createTypeForFragment(
            collectionsItem,
            where,
            'resultType',
          )}, ${createTypeForFragment(collectionsItem, proxyAction, 'entryType')}>`,
        };
      }

      return types;
    });

  const fragmentArrayElements = instanceOwnKeys
    .filter(itemFiledName => del[itemFiledName].constructor.name === baseLibraryDescription.collectionId)
    .filter(itemFiledName => baseElementsActionsDescription[del[itemFiledName].InstanceType.name])
    .map(itemFiledName => {
      const collectionsItem = new del[itemFiledName].InstanceType(
        del[itemFiledName].rootLocator,
        del[itemFiledName].identifier,
        del[itemFiledName].rootElements.get(0),
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
        types[itemFiledName][action] = `ICollectionAction<${getElementType(
          collectionsItem,
          action,
          'resultType',
        )}, ${getElementType(collectionsItem, action, 'entryType')}>`;
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
    .map(itemFiledName => ({ [itemFiledName]: getElementType(instance[itemFiledName], action, actionType) }));

  return createType(Array.from(instanceElements), action);
}

function getElementType(instance, action: string, actionType: string) {
  const { baseElementsActionsDescription } = getConfiguration();
  const prop = instance.constructor.name;

  const types = {};
  if (baseElementsActionsDescription[prop][action] && baseElementsActionsDescription[prop][action][actionType]) {
    types[action] = `${prop}${baseElementsActionsDescription[prop][action][actionType]}`;
  }

  return types;
}

export { getElementsTypes, getCollectionTypes, createTypeForFragment };
