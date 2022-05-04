/* eslint-disable complexity, sonarjs/cognitive-complexity*/
import { getConfiguration } from './config';

function checkThatElementHasAction(baseElementsActionsDescription, element, action) {
  return baseElementsActionsDescription[element][action];
}

function checkThatFragmentHasItemsToAction(fragment, action: string) {
  const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  const pageFragments = Object.getOwnPropertyNames(fragment);
  const interactionFields = pageFragments.filter(item => !systemPropsList.includes(item));

  let result = false;
  for (const fragmentChildFieldName of interactionFields) {
    const childConstructorName = fragment[fragmentChildFieldName].constructor.name;

    if (childConstructorName.includes(baseLibraryDescription.fragmentId)) {
      result = checkThatFragmentHasItemsToAction(fragment[fragmentChildFieldName], action);

      if (result) return result;
    } else if (childConstructorName.includes(baseLibraryDescription.collectionId)) {
      const collection = fragment[fragmentChildFieldName];
      const CollectionInstanceType = fragment[fragmentChildFieldName].InstanceType;

      const result = checkThatFragmentHasItemsToAction(
        new CollectionInstanceType(
          collection[baseLibraryDescription.rootLocatorId],
          collection[baseLibraryDescription.entityId],
          collection.rootElements.get(0),
        ),
        action,
      );

      if (result) return result;
    } else if (baseElementsActionsDescription[childConstructorName]) {
      result = checkThatElementHasAction(baseElementsActionsDescription, childConstructorName, action);
      if (result) return result;
    }
  }

  return result;
}

export { checkThatFragmentHasItemsToAction };
