import { getConfiguration } from './config';

function findAllBaseElements(instance, baseElements = []) {
  const { systemPropsList, baseElementsList } = getConfiguration();

  const fragment = instance;

  if (fragment.constructor.name === 'Collection') {
    baseElements.push('Collection');

    if (baseElementsList.has(fragment.InstanceType.constructor.name)) {
      baseElements.push(fragment.InstanceType.constructor.name);
    } else {
      const CollectionInstanceType = fragment.InstanceType;
      const collectionInstance = new CollectionInstanceType(
        fragment.rootLocator,
        fragment.identifier,
        fragment.rootElements.get(0),
      );

      const nestedBaseElements = findAllBaseElements(collectionInstance, []);

      baseElements.push(...nestedBaseElements);
    }
  }

  const pageFragments = Object.getOwnPropertyNames(fragment);

  const interactionFields = pageFragments.filter(item => !systemPropsList.has(item));

  interactionFields.forEach(fragmentChildFieldName => {
    const childConstructorName = fragment[fragmentChildFieldName].constructor.name;

    if (childConstructorName.includes('Fragment') || childConstructorName === 'Collection') {
      const nestedBaseElements = findAllBaseElements(fragment[fragmentChildFieldName], []);

      baseElements.push(...nestedBaseElements);
    } else if (baseElementsList.has(childConstructorName)) {
      baseElements.push(childConstructorName);
    }
  });

  return baseElements;
}

export { findAllBaseElements };
