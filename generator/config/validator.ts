import { isObject, isString, getType } from 'sat-utils';

const baseLibraryDescriptionExpectedKeys = [
  'entityId',
  'rootLocatorId',
  'pageId',
  'fragmentId',
  'collectionId',
  'collectionItemId',
  'collectionRootElementsId',
  'waitOptionsId',
  'collectionActionId',
  'collectionCheckId',
  'getDataMethod',
  'getVisibilityMethod',
  'getBaseElementFromCollectionByIndex',
];
/**
 * @example {object} baseLibraryDescription
 * {
 * 		entityId: 'identifier',
 * 		rootLocatorId: 'rootLocator',
 * 		pageId: 'Page',
 * 		fragmentId: 'Fragment',
 * 		collectionId: 'Collection',
 * 		collectionItemId: 'InstanceType',
 * 		collectionRootElementsId: 'rootElements',
 * 		waitOptionsId: 'IWaitOpts',
 * 		collectionActionId: 'ICollectionAction',
 * 		collectionCheckId: 'ICollectionCheck',
 * 		getDataMethod: 'get',
 * 		getVisibilityMethod: 'isDisplayed',
 * 		getBaseElementFromCollectionByIndex: 'get'
 * }
 */

function validateBaseLibraryDescription(baseLibraryDescription: { [k: string]: string }) {
  if (!isObject(baseLibraryDescription)) {
    throw new TypeError('"baseLibraryDescription" should be an object');
  }

  baseLibraryDescriptionExpectedKeys.forEach(key => {
    if (!baseLibraryDescription.hasOwnProperty(key)) {
      throw new TypeError(`"baseLibraryDescription" should have "${key}" property`);
    }
    if (!isString(baseLibraryDescription[key])) {
      throw new TypeError(
        `"baseLibraryDescription" should have property "${key}" with value "string", current type is ${getType(
          baseLibraryDescription[key],
        )}`,
      );
    }
  });
}

export { validateBaseLibraryDescription };
