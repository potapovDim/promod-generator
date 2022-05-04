import { getConfiguration } from './config';

const getElementType = elementName => {
  const { sendKeysElements } = getConfiguration();
  // TODO Collection flexible types
  const baseAllTypes = `${elementName}Action, ${elementName}GetRes, ${elementName}IsDispRes,`;

  return sendKeysElements.has(elementName) ? `${baseAllTypes} ${elementName}SendKeys,` : baseAllTypes;
};

const getBaseImport = baseElements => {
  const uniqBaseElements = Array.from(new Set(baseElements));

  return uniqBaseElements
    .filter(item => item !== 'Collection')
    .reduce(
      (importString, element) => `${importString}\n  ${getElementType(element)}`,
      // TODO Collection flexible types
      `${uniqBaseElements.includes('Collection') ? 'IWaitOpts, ICollectionAction, ICollectionCheck,' : 'IWaitOpts,'}`,
    );
};

export { getBaseImport };
