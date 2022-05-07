import { getConfiguration } from './config';

const getElementImportType = elementName => {
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

  const collectionActionsImportPart = uniqBaseElements.includes(baseLibraryDescription.collectionId)
    ? `${baseLibraryDescription.collectionActionId}, ${baseLibraryDescription.collectionCheckId},`
    : '';

  return uniqBaseElements
    .filter(item => item !== baseLibraryDescription.collectionId)
    .reduce(
      (importString, element) => `${importString}\n  ${getElementImportType(element)}`,
      `${baseLibraryDescription.waitOptionsId}, ${collectionActionsImportPart}`,
    );
};

export { getBaseImport };
