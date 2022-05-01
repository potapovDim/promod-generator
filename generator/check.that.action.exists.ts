/* eslint-disable sonarjs/prefer-immediate-return, complexity, sonarjs/cognitive-complexity*/
import { systemProps, allBaseElements } from './base';

function checkThatFragmentHasItemsToAction(instance, actionElements = new Set()) {
  const fragment = instance;

  if (fragment.constructor.name === 'Collection' && actionElements === allBaseElements) {
    return true;
  }

  if (actionElements.size === 0) {
    return true;
  }

  const pageFragments = Object.getOwnPropertyNames(fragment);

  const interactionFields = pageFragments.filter(item => !systemProps.has(item));

  for (const fragmentChildFieldName of interactionFields) {
    const childConstructorName = fragment[fragmentChildFieldName].constructor.name;

    if (childConstructorName.includes('Fragment')) {
      const result = checkThatFragmentHasItemsToAction(fragment[fragmentChildFieldName], actionElements);

      if (result) return result;
    }

    if (childConstructorName === 'InstanceType') {
      const collection = fragment[fragmentChildFieldName];
      const CollectionInstanceType = fragment[fragmentChildFieldName].InstanceType;

      const result = checkThatFragmentHasItemsToAction(
        new CollectionInstanceType(collection.rootLocator, collection.identifier, collection.rootElements.get(0)),
        actionElements,
      );

      if (result) return result;
    }

    if (actionElements.has(childConstructorName)) return true;
  }
}

export { checkThatFragmentHasItemsToAction };
