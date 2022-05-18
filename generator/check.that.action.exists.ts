/* eslint-disable complexity, sonarjs/cognitive-complexity, no-console*/
import { getConfiguration } from './config/config';
import { checkThatElementHasAction } from './get.base.elements';
import {
  getCollectionItemInstance,
  isCollectionWithItemBaseElement,
  isCollectionWithItemFragment,
} from './utils.collection';

function checkThatFragmentHasItemsToAction(instance, action: string) {
  const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  if (isCollectionWithItemBaseElement(instance)) {
    return checkThatElementHasAction(instance[baseLibraryDescription.collectionItemId]?.name, action);
  }

  const pageFragments = Object.getOwnPropertyNames(instance);
  const interactionFields = pageFragments.filter(item => !systemPropsList.includes(item));

  let result = false;
  for (const fragmentChildFieldName of interactionFields) {
    const childConstructorName = instance[fragmentChildFieldName].constructor.name;

    if (childConstructorName.includes(baseLibraryDescription.fragmentId)) {
      result = checkThatFragmentHasItemsToAction(instance[fragmentChildFieldName], action);

      if (result) return result;
    } else if (isCollectionWithItemFragment(instance[fragmentChildFieldName])) {
      const collectionInstance = getCollectionItemInstance(instance[fragmentChildFieldName]);

      const result = checkThatFragmentHasItemsToAction(collectionInstance, action);

      if (result) return result;
    } else if (isCollectionWithItemBaseElement(instance[fragmentChildFieldName])) {
      result = checkThatElementHasAction(
        instance[fragmentChildFieldName][baseLibraryDescription.collectionItemId]?.name,
        action,
      );
      if (result) return result;
    } else if (baseElementsActionsDescription[childConstructorName]) {
      result = checkThatElementHasAction(childConstructorName, action);
      if (result) return result;
    }
  }

  return result;
}

export { checkThatFragmentHasItemsToAction };
