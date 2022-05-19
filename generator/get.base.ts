/* eslint-disable sonarjs/cognitive-complexity, no-console*/
import { isString } from 'sat-utils';
import { getConfiguration } from './config/config';
import { getCollectionItemInstance, isCollectionWithItemBaseElement } from './utils.collection';
import { getFragmentInteractionFields } from './utils';

function checkThatBaseElement(elementConstructorName: string) {
  const { baseElementsActionsDescription } = getConfiguration();
  if (!isString(elementConstructorName)) {
    elementConstructorName = (elementConstructorName as any as object).constructor.name;
  }

  return Boolean(baseElementsActionsDescription[elementConstructorName]);
}

function checkThatElementHasAction(elementConstructorName: string, action: string) {
  const { baseElementsActionsDescription } = getConfiguration();

  if (!isString(elementConstructorName)) {
    elementConstructorName = (elementConstructorName as any as object).constructor.name;
  }

  if (baseElementsActionsDescription[elementConstructorName]) {
    return Boolean(baseElementsActionsDescription[elementConstructorName][action]);
  } else {
    console.error(`${elementConstructorName} does not exist in 'baseElementsActionsDescription'`);

    return false;
  }
}

function getElementType(instance, action: string, actionType: string) {
  const { baseElementsActionsDescription } = getConfiguration();
  const prop = instance.constructor.name;

  if (baseElementsActionsDescription[prop][action] && baseElementsActionsDescription[prop][action][actionType]) {
    return `${prop}${baseElementsActionsDescription[prop][action][actionType]}`;
  }

  return '';
}

function getElementActionType(instance, action: string, actionType: string) {
  const types = {};

  if (checkThatElementHasAction(instance, action)) {
    types[action] = getElementType(instance, action, actionType);
  }

  return types;
}

function getAllBaseElements(instance, baseElements = []) {
  const { baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  if (instance.constructor.name === baseLibraryDescription.collectionId) {
    baseElements.push(baseLibraryDescription.collectionId);

    if (isCollectionWithItemBaseElement(instance)) {
      baseElements.push(instance[baseLibraryDescription.collectionItemId].name);
    } else {
      const collectionInstance = getCollectionItemInstance(instance);

      const nestedBaseElements = getAllBaseElements(collectionInstance, []);

      baseElements.push(...nestedBaseElements);
    }
  }

  const interactionFields = getFragmentInteractionFields(instance);

  interactionFields.forEach(fragmentChildFieldName => {
    const childConstructorName = instance[fragmentChildFieldName].constructor.name;

    if (
      childConstructorName.includes(baseLibraryDescription.fragmentId) ||
      childConstructorName === baseLibraryDescription.collectionId
    ) {
      const nestedBaseElements = getAllBaseElements(instance[fragmentChildFieldName], []);

      baseElements.push(...nestedBaseElements);
    } else if (baseElementsActionsDescription[childConstructorName]) {
      baseElements.push(childConstructorName);
    }
  });

  return baseElements;
}

function getFragmentBaseElementsFields(instance) {
  const interationFields = getFragmentInteractionFields(instance);

  return interationFields.filter(field => checkThatBaseElement(instance[field]));
}

export {
  checkThatBaseElement,
  getAllBaseElements,
  checkThatElementHasAction,
  getElementType,
  getElementActionType,
  getFragmentBaseElementsFields,
};
