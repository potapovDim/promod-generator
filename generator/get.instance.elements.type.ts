/* eslint-disable unicorn/prefer-switch, no-use-before-define, sonarjs/cognitive-complexity */
import { createType } from './create.type';
import { getConfiguration } from './config/config';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';
import { checkThatElementHasAction, getElementActionType, getElementType } from './get.base';
import { getFragmentInteractionFields } from './utils';
import {
  getCollectionItemInstance,
  isCollectionWithItemBaseElement,
  isCollectionWithItemFragment,
} from './utils.collection';

function getCollectionTypes(instance, action, actionType) {
  const { resultActionsMap, baseElementsActionsDescription, collectionWaitingTypes, collectionActionTypes } =
    getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  const collectionsItem = getCollectionItemInstance(instance);

  const getTypeHandler = baseElementsActionsDescription[collectionsItem.constructor.name]
    ? getElementType
    : getFragmentTypes;

  const checkActionHandler = baseElementsActionsDescription[collectionsItem.constructor.name]
    ? checkThatElementHasAction
    : checkThatFragmentHasItemsToAction;

  if (!checkActionHandler(collectionsItem, action)) {
    return '';
  }

  const types = {};

  if (collectionWaitingTypes[action]) {
    const { visible, where, action: proxyAction, compare } = collectionWaitingTypes[action];
    types[action] = `ICollectionCheck<
    ${getTypeHandler(collectionsItem, where, 'resultType')},
    ${getTypeHandler(collectionsItem, visible, 'resultType')},
    ${getTypeHandler(collectionsItem, proxyAction, 'entryType')},
    ${getTypeHandler(collectionsItem, compare, 'resultType')}
  > | ${getTypeHandler(collectionsItem, compare, 'resultType')} | ${getTypeHandler(
      collectionsItem,
      compare,
      'resultType',
    )}[]`;
  } else if (actionType === 'entryType' && collectionActionTypes[action]) {
    const { where, visible, action: proxyAction } = collectionActionTypes[action];
    types[action] = `ICollectionAction<
    ${getTypeHandler(collectionsItem, where, 'resultType')},
    ${getTypeHandler(collectionsItem, visible, 'resultType')},
     ${getTypeHandler(collectionsItem, proxyAction, 'entryType')}>`;
  } else {
    types[action] = `${getTypeHandler(collectionsItem, action, 'resultType')}[]`;
  }

  return createType(types, action);
}

function getFragmentTypes(instance, action, actionType) {
  const {
    resultActionsMap,
    baseElementsActionsDescription,
    collectionWaitingTypes,
    baseLibraryDescription,
    collectionActionTypes,
  } = getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  if (instance.constructor.name === baseLibraryDescription.collectionId) {
    return getCollectionTypes(instance, action, actionType);
  }

  const instanceOwnKeys = getFragmentInteractionFields(instance);

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
      [itemFiledName]: { [action]: getFragmentTypes(instance[itemFiledName], action, actionType) },
    }));

  const fragmentArrayFragments = instanceOwnKeys
    .filter(itemFiledName => instance[itemFiledName].constructor.name.includes(baseLibraryDescription.collectionId))
    .filter(itemFiledName => isCollectionWithItemFragment(instance[itemFiledName]))
    .map(itemFiledName => {
      const collectionsItem = getCollectionItemInstance(instance[itemFiledName]);
      const types = { [itemFiledName]: {} };

      if (!checkThatFragmentHasItemsToAction(collectionsItem, action)) {
        return types;
      }

      if (collectionWaitingTypes[action]) {
        const { visible, where, action: proxyAction, compare } = collectionWaitingTypes[action];
        types[itemFiledName][action] = `ICollectionCheck<
        ${getFragmentTypes(collectionsItem, where, 'resultType')},
        ${getFragmentTypes(collectionsItem, visible, 'resultType')},
        ${getFragmentTypes(collectionsItem, proxyAction, 'entryType')},
        ${getFragmentTypes(collectionsItem, compare, 'resultType')},
      > | ${getFragmentTypes(collectionsItem, compare, 'resultType')} | ${getFragmentTypes(
          collectionsItem,
          compare,
          'resultType',
        )}[]`;
      } else if (actionType === 'entryType' && collectionActionTypes[action]) {
        const { visible, where, action: proxyAction } = collectionActionTypes[action];
        types[itemFiledName][action] = `ICollectionAction<
        ${getFragmentTypes(collectionsItem, where, 'resultType')},
        ${getFragmentTypes(collectionsItem, visible, 'resultType')},
        ${getFragmentTypes(collectionsItem, proxyAction, 'entryType')}>`;
      } else {
        types[itemFiledName][action] = `${getFragmentTypes(collectionsItem, action, 'resultType')}[]`;
      }

      return types;
    });

  const fragmentArrayElements = instanceOwnKeys
    .filter(itemFiledName => instance[itemFiledName].constructor.name === baseLibraryDescription.collectionId)
    .filter(itemFiledName => isCollectionWithItemBaseElement(instance[itemFiledName]))
    .map(itemFiledName => {
      const collectionsItem = new instance[itemFiledName][baseLibraryDescription.collectionItemId](
        instance[itemFiledName].rootLocator,
        instance[itemFiledName].identifier,
        instance[itemFiledName][baseLibraryDescription.collectionRootElementsId][
          baseLibraryDescription.getBaseElementFromCollectionByIndex
        ](0),
      );

      const types = { [itemFiledName]: {} };

      if (collectionWaitingTypes[action]) {
        const { where, visible, action: proxyAction, compare } = collectionWaitingTypes[action];
        types[itemFiledName][action] = `ICollectionCheck<
        ${getElementType(collectionsItem, where, 'resultType')},
        ${getElementType(collectionsItem, visible, 'resultType')},
        ${getElementType(collectionsItem, proxyAction, 'entryType')},
        ${getElementType(collectionsItem, compare, 'resultType')}
      > | ${getElementType(collectionsItem, compare, 'resultType')} | ${getElementType(
          collectionsItem,
          compare,
          'resultType',
        )}[]`;
      } else if (actionType === 'entryType' && collectionActionTypes[action]) {
        const { where, visible, action: proxyAction } = collectionActionTypes[action];
        types[itemFiledName][action] = `ICollectionAction<
        ${getElementType(collectionsItem, where, 'resultType')},
        ${getElementType(collectionsItem, visible, 'resultType')},
        ${getElementType(collectionsItem, proxyAction, 'entryType')}>`;
      } else {
        types[itemFiledName][action] = `${getElementType(collectionsItem, action, 'resultType')}[]`;
      }

      return types;
    });

  return createType(
    [...fragmentElements, ...fragmentArrayElements, ...fragmentFragments, ...fragmentArrayFragments],
    action,
  );
}

function getElementsTypes(instance, action, actionType) {
  const { resultActionsMap } = getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  const instanceElements = getFragmentInteractionFields(instance)
    .filter(itemFiledName => checkThatElementHasAction(instance[itemFiledName], action))
    .map(itemFiledName => ({ [itemFiledName]: getElementActionType(instance[itemFiledName], action, actionType) }));

  return createType(Array.from(instanceElements), action);
}

export { getCollectionTypes, getFragmentTypes, getElementsTypes };
