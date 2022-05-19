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

function checThatAllFragmentFieldsAreBaseElements(instance) {
  const interactionFields = getFragmentInteractionFields(instance);

  return interactionFields.every(field => checkThatBaseElement(instance[field]));
}

function getPathesToCollections(childInstance, name) {
  const { baseLibraryDescription } = getConfiguration();

  function getPathToListIfExists(instance) {
    const pathes = {};

    if (isCollectionWithItemBaseElement(instance)) {
      const collectionItemInstance = getCollectionItemInstance(instance);
      const _action = null;
      const _where = getElementType(collectionItemInstance, baseLibraryDescription.getDataMethod, 'resultType');
      const _visible = getElementType(collectionItemInstance, baseLibraryDescription.getVisibilityMethod, 'resultType');

      return { _action, _where, _visible };
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
        isCollectionWithItemFragment(instance[field]) &&
        checThatAllFragmentFieldsAreBaseElements(getCollectionItemInstance(instance[field]))
      ) {
        const collectionItemInstance = getCollectionItemInstance(instance[field]);

        const _action = getFragmentInteractionFields(collectionItemInstance);
        const _where = getElementsTypes(collectionItemInstance, baseLibraryDescription.getDataMethod, 'resultType');
        const _visible = getElementsTypes(
          collectionItemInstance,
          baseLibraryDescription.getVisibilityMethod,
          'resultType',
        );

        pathes[field] = {
          _visible,
          _where,
          _action,
        };

        return pathes;
      } else if (
        isCollectionWithItemFragment(instance[field]) &&
        getFragmentBaseElementsFields(getCollectionItemInstance(instance[field])).length
      ) {
        const collectionItemInstance = getCollectionItemInstance(instance[field]);

        const _action = getFragmentBaseElementsFields(getCollectionItemInstance(instance[field]));
        const _where = getElementsTypes(collectionItemInstance, baseLibraryDescription.getDataMethod, 'resultType');
        const _visible = getElementsTypes(
          collectionItemInstance,
          baseLibraryDescription.getVisibilityMethod,
          'resultType',
        );

        pathes[field] = {
          _visible,
          _where,
          _action,
        };

        return pathes;
      } else if (isCollectionWithItemBaseElement(instance[field])) {
        const result = checkThatElementHasAction(
          instance[field][baseLibraryDescription.collectionItemId]?.name,
          baseLibraryDescription.getDataMethod,
        );

        if (result) {
          const collectionItemInstance = getCollectionItemInstance(instance[field]);

          const _action = null;
          const _where = getElementType(collectionItemInstance, baseLibraryDescription.getDataMethod, 'resultType');
          const _visible = getElementType(
            collectionItemInstance,
            baseLibraryDescription.getVisibilityMethod,
            'resultType',
          );

          pathes[field] = {
            _action,
            _visible,
            _where,
          };
          return pathes;
        }
      }
    }
  }

  const result = getPathToListIfExists(childInstance);

  if (result) return { [name]: result };
}

export { getPathesToCollections };
