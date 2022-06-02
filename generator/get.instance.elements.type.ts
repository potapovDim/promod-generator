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

function getColletionActionType(collectionsItem, getTypes, collectionActionType) {
  return Object.keys(collectionActionType).reduce((typeSctring, actionKey, index, allActions) => {
    const actionDescriptor = collectionActionType[actionKey] as { action: string; actionType: string };
    typeSctring +=
      index === 0 || allActions.length - 1 !== index
        ? `${getTypes(collectionsItem, actionDescriptor.action, actionDescriptor.actionType)},`
        : `${getTypes(collectionsItem, actionDescriptor.action, actionDescriptor.actionType)}`;
    return typeSctring;
  }, '');
}

function getCollectionTypes(instance, action, actionType) {
  const {
    baseLibraryDescription,
    resultActionsMap,
    baseElementsActionsDescription,
    collectionWaitingTypes,
    collectionActionTypes,
  } = getConfiguration();

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
    const actionDescriptor = collectionWaitingTypes[action];

    const colletionItemType = getColletionActionType(collectionsItem, getTypeHandler, actionDescriptor);

    types[action] = `${baseLibraryDescription.collectionCheckId}<${colletionItemType}>
    | ${getTypeHandler(collectionsItem, actionDescriptor.compare.action, actionDescriptor.compare.actionType)}
    | ${getTypeHandler(collectionsItem, actionDescriptor.compare.action, actionDescriptor.compare.actionType)}[]`;
  } else if (actionType === 'entryType' && collectionActionTypes[action]) {
    const actionDescriptor = collectionActionTypes[action];

    const colletionItemType = getColletionActionType(collectionsItem, getTypeHandler, actionDescriptor);

    types[action] = `${baseLibraryDescription.collectionActionId}<${colletionItemType}>`;
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
        const actionDescriptor = collectionWaitingTypes[action];

        const colletionItemType = getColletionActionType(collectionsItem, getFragmentTypes, actionDescriptor);

        types[itemFiledName][action] = `${baseLibraryDescription.collectionCheckId}<${colletionItemType}>
        | ${getFragmentTypes(
          collectionsItem,
          collectionWaitingTypes[action].compare.action,
          collectionWaitingTypes[action].compare.actionType,
        )}
        | ${getFragmentTypes(
          collectionsItem,
          collectionWaitingTypes[action].compare.action,
          collectionWaitingTypes[action].compare.actionType,
        )}[]`;
      } else if (actionType === 'entryType' && collectionActionTypes[action]) {
        const actionDescriptor = collectionActionTypes[action];
        const colletionItemType = getColletionActionType(collectionsItem, getFragmentTypes, actionDescriptor);

        types[itemFiledName][action] = `${baseLibraryDescription.collectionActionId}<${colletionItemType}>`;
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
        const actionDescriptor = collectionWaitingTypes[action] as {
          [k: string]: { action: string; actionType: string };
        };

        const colletionItemType = getColletionActionType(collectionsItem, getElementType, actionDescriptor);

        types[itemFiledName][action] = `${baseLibraryDescription.collectionCheckId}<${colletionItemType}>
        | ${getElementType(collectionsItem, actionDescriptor.compare.action, actionDescriptor.compare.actionType)}
        | ${getElementType(collectionsItem, actionDescriptor.compare.action, actionDescriptor.compare.actionType)}[]`;
      } else if (actionType === 'entryType' && collectionActionTypes[action]) {
        const actionDescriptor = collectionActionTypes[action];

        const colletionItemType = getColletionActionType(collectionsItem, getElementType, actionDescriptor);

        types[itemFiledName][action] = `${baseLibraryDescription.collectionActionId}<${colletionItemType}>`;
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
