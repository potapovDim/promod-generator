/* eslint-disable sonarjs/cognitive-complexity, no-console*/
import { getConfiguration } from './config';

function checkThatElementHasAction(elementConstructorName, action) {
  const { baseElementsActionsDescription } = getConfiguration();

  if (baseElementsActionsDescription[elementConstructorName]) {
    return Boolean(baseElementsActionsDescription[elementConstructorName][action]);
  } else {
    console.error(`${elementConstructorName} does not exist in 'baseElementsActionsDescription'`);

    return false;
  }
}

function findAllBaseElements(instance, baseElements = []) {
  const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  const fragment = instance;

  if (fragment.constructor.name === baseLibraryDescription.collectionId) {
    baseElements.push(baseLibraryDescription.collectionId);

    if (baseElementsActionsDescription[fragment[baseLibraryDescription.collectionItemId].name]) {
      baseElements.push(fragment[baseLibraryDescription.collectionItemId].name);
    } else {
      const collectionInstance = new fragment[baseLibraryDescription.collectionItemId](
        fragment[baseLibraryDescription.rootLocatorId],
        fragment[baseLibraryDescription.entityId],
        fragment.rootElements.get(0),
      );

      const nestedBaseElements = findAllBaseElements(collectionInstance, []);

      baseElements.push(...nestedBaseElements);
    }
  }

  const pageFragments = Object.getOwnPropertyNames(fragment);

  const interactionFields = pageFragments.filter(item => !systemPropsList.includes(item));

  interactionFields.forEach(fragmentChildFieldName => {
    const childConstructorName = fragment[fragmentChildFieldName].constructor.name;

    if (
      childConstructorName.includes(baseLibraryDescription.fragmentId) ||
      childConstructorName === baseLibraryDescription.collectionId
    ) {
      const nestedBaseElements = findAllBaseElements(fragment[fragmentChildFieldName], []);

      baseElements.push(...nestedBaseElements);
    } else if (baseElementsActionsDescription[childConstructorName]) {
      baseElements.push(childConstructorName);
    }
  });

  return baseElements;
}

export { findAllBaseElements, checkThatElementHasAction };
