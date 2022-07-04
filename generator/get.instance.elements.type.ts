/* eslint-disable unicorn/prefer-switch, no-use-before-define, sonarjs/cognitive-complexity */
import { createType } from './create.type';
import { getConfiguration } from './config/config';
import { checkThatFragmentHasItemsToAction } from './check.that.action.exists';
import { checkThatElementHasAction, checkThatBaseElement, getElementActionType, getElementType } from './get.base';
import { getFragmentInteractionFields } from './utils';
import {
  getCollectionItemInstance,
  isCollectionWithItemBaseElement,
  isCollectionWithItemFragment,
} from './utils.collection';

function getColletionActionType(collectionsItem, getTypes, collectionActionType) {
  return Object.keys(collectionActionType).reduce((typeString, actionKey, index, allActions) => {
    const actionDescriptor = collectionActionType[actionKey] as { action: string; actionType: string };

    if (allActions.length - 1 === index) {
      return (typeString += `${getTypes(collectionsItem, actionDescriptor.action, actionDescriptor.actionType)}`);
    }

    return (typeString += `${getTypes(collectionsItem, actionDescriptor.action, actionDescriptor.actionType)},`);
  }, '');
}

function getCollectionTypes(instance, action, actionType) {
  const { baseCollectionActionsDescription, baseElementsActionsDescription } = getConfiguration();

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

  const { generic, endType, ...actionDescriptor } = baseCollectionActionsDescription[action][actionType];

  let colletionItemType = getColletionActionType(collectionsItem, getTypeHandler, actionDescriptor);

  if (generic) {
    colletionItemType = `${generic}<${colletionItemType}>`;
  }
  if (endType) {
    colletionItemType = `${colletionItemType}${endType}`;
  }

  types[action] = colletionItemType;
  return types;
}

function getFragmentTypes(instance, action, actionType) {
  const { resultActionsMap, baseLibraryDescription } = getConfiguration();

  if (resultActionsMap[action] === 'void' && actionType === 'resultType') return 'void';

  if (instance.constructor.name === baseLibraryDescription.collectionId) {
    const types = getCollectionTypes(instance, action, actionType);

    return createType(types, action);
  }

  const instanceOwnKeys = getFragmentInteractionFields(instance);

  const fragmentElements = instanceOwnKeys
    .filter(itemFiledName => {
      // logger here
      return (
        checkThatBaseElement(instance[itemFiledName]) && checkThatElementHasAction(instance[itemFiledName], action)
      );
    })
    .map(itemFiledName => ({
      [itemFiledName]: { [action]: getElementType(instance[itemFiledName], action, actionType) },
    }));

  const fragmentFragments = instanceOwnKeys
    .filter(itemFiledName => {
      // logger here
      return (
        instance[itemFiledName].constructor.name.includes(baseLibraryDescription.fragmentId) &&
        checkThatFragmentHasItemsToAction(instance[itemFiledName], action)
      );
    })
    .map(itemFiledName => {
      // logger here
      return {
        [itemFiledName]: { [action]: getFragmentTypes(instance[itemFiledName], action, actionType) },
      };
    });

  const fragmentArrayItems = instanceOwnKeys
    .filter(itemFiledName => instance[itemFiledName].constructor.name.includes(baseLibraryDescription.collectionId))
    .filter(itemFiledName => {
      // logger here
      return (
        (isCollectionWithItemFragment(instance[itemFiledName]) &&
          checkThatFragmentHasItemsToAction(getCollectionItemInstance(instance[itemFiledName]), action)) ||
        (isCollectionWithItemBaseElement(instance[itemFiledName]) &&
          checkThatElementHasAction(getCollectionItemInstance(instance[itemFiledName]), action))
      );
    })
    .map(itemFiledName => {
      // logger here
      return {
        [itemFiledName]: {
          [action]: createType(getCollectionTypes(instance[itemFiledName], action, actionType), action),
        },
      };
    });

  return createType([...fragmentElements, ...fragmentArrayItems, ...fragmentFragments], action);
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
