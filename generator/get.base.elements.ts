import { getConfiguration } from './config';

function findAllBaseElements(instance, baseElements = []) {
  const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  const fragment = instance;

  if (fragment.constructor.name === baseLibraryDescription.collectionId) {
    baseElements.push(baseLibraryDescription.collectionId);

    if (baseElementsActionsDescription[fragment[baseLibraryDescription.collectionItemId].constructor.name]) {
      baseElements.push(fragment.InstanceType.constructor.name);
    } else {
      const collectionInstance = new fragment.InstanceType(
        fragment.rootLocator,
        fragment.identifier,
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

export { findAllBaseElements };
