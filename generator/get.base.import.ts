import { getConfiguration } from './config';

const getElementType = elementName => {
  const { baseElementsActionsDescription } = getConfiguration();

  const avaliableAtions = Array.from(
    new Set(
      Object.values(baseElementsActionsDescription[elementName])
        .flatMap(actionDescriptors => Object.values(actionDescriptors))
        .values(),
    ),
  );

  return avaliableAtions.reduce((actionTypes, actionType) => `${actionTypes} ${elementName}${actionType},`, ``);
};

const getBaseImport = baseElements => {
  const { baseLibraryDescription } = getConfiguration();
  const uniqBaseElements = Array.from(new Set(baseElements));

  return uniqBaseElements
    .filter(item => item !== baseLibraryDescription.collectionId)
    .reduce(
      (importString, element) => `${importString}\n  ${getElementType(element)}`,
      `${
        // TODO Collection flexible types
        uniqBaseElements.includes(baseLibraryDescription.collectionId)
          ? 'IWaitOpts, ICollectionAction, ICollectionCheck,'
          : 'IWaitOpts,'
      }`,
    );
};

export { getBaseImport };
