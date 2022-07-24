/* eslint-disable sonarjs/cognitive-complexity, no-console*/

// TODO how to handle collection in collection

import { getConfiguration } from './config/config';
import { getElementsTypes } from './get.instance.elements.type';
import { getFragmentInteractionFields } from './utils';
import {
  checkThatElementHasAction,
  getElementType,
  checkThatBaseElement,
  getFragmentBaseElementsFields,
} from './get.base';
import {
  getCollectionItemInstance,
  isCollectionWithItemBaseElement,
  isCollectionWithItemFragment,
} from './utils.collection';

function getCollectionItemTypes(collectionItemInstance) {
  const { collectionRandomDataDescription } = getConfiguration();

  const getType = checkThatBaseElement(collectionItemInstance) ? getElementType : getElementsTypes;

  const instanceInteractionFields = getFragmentInteractionFields(collectionItemInstance);

  const _fields = instanceInteractionFields.length ? instanceInteractionFields : null;

  const types = Object.keys(collectionRandomDataDescription).reduce((description, key) => {
    description[key] = getType(
      collectionItemInstance,
      collectionRandomDataDescription[key].action,
      collectionRandomDataDescription[key].actionType,
    );

    return description;
  }, {});

  return { _fields, ...types };
}

function getPathesToCollections(childInstance, name) {
  const { baseLibraryDescription } = getConfiguration();

  function getPathToListIfExists(instance) {
    const pathes = {};

    if (isCollectionWithItemBaseElement(instance)) {
      const collectionItemInstance = getCollectionItemInstance(instance);

      return getCollectionItemTypes(collectionItemInstance);
    }

    const interactionFields = getFragmentInteractionFields(instance);

    for (const field of interactionFields) {
      const childConstructorName = instance[field].constructor.name;

      if (childConstructorName.includes(baseLibraryDescription.fragmentId)) {
        const result = getPathToListIfExists(instance[field]);

        if (result) {
          pathes[field] = result;
          return pathes;
        }
      } else if (
        (isCollectionWithItemFragment(instance[field]) &&
          getFragmentBaseElementsFields(getCollectionItemInstance(instance[field])).length) ||
        (isCollectionWithItemBaseElement(instance[field]) &&
          checkThatElementHasAction(getCollectionItemInstance(instance[field]), baseLibraryDescription.getDataMethod))
      ) {
        const collectionItemInstance = getCollectionItemInstance(instance[field]);

        pathes[field] = getCollectionItemTypes(collectionItemInstance);

        return pathes;
      }
    }
  }

  const result = getPathToListIfExists(childInstance);

  if (result) return { [name]: result };
}

export { getPathesToCollections };
