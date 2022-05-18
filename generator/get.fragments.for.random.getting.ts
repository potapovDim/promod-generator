/* eslint-disable sonarjs/cognitive-complexity, no-console*/
import { getConfiguration } from './config/config';
import { checkThatElementHasAction } from './get.base.elements';
import { getFragmentTypes, getElementType } from './get.instance.elements.type';
import { getCollectionItemInstance, isCollectionWithItemBaseElement } from './utils.collection';

function getFragmentInteractionFields(instance) {
  const { systemPropsList } = getConfiguration();
  const fields = Object.getOwnPropertyNames(instance);
  return fields.filter(item => !systemPropsList.includes(item));
}

function checThatAllFragmentFieldsAreBaseElements(instance) {
  const { baseLibraryDescription } = getConfiguration();
  const interactionFields = getFragmentInteractionFields(instance);

  return interactionFields.every(field =>
    checkThatElementHasAction(instance[field].constructor.name, baseLibraryDescription.getDataMethod),
  );
}

function getPathesToCollections(childInstance, name) {
  const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  function getPathToListIfExists(instance) {
    const pathes = {};

    if (isCollectionWithItemBaseElement(instance)) {
      const collectionItemInstance = getCollectionItemInstance(instance);
      const _action = null;
      const _where = getElementType(collectionItemInstance, baseLibraryDescription.getDataMethod, 'resultType');
      const _visible = getElementType(collectionItemInstance, baseLibraryDescription.getVisibilityMethod, 'resultType');

      return { _action, _where, _visible };
    }

    const fields = Object.getOwnPropertyNames(instance);

    const interactionFields = fields.filter(item => !systemPropsList.includes(item));

    for (const field of interactionFields) {
      const childConstructorName = instance[field].constructor.name;
      let doesCollectionItemHaveAllBaseElements;

      const isFieldCollection = childConstructorName.includes(baseLibraryDescription.collectionId);
      const isCollectionItemFragment = instance[field][baseLibraryDescription.collectionItemId]?.name.includes(
        baseLibraryDescription.fragmentId,
      );

      if (isFieldCollection && isCollectionItemFragment) {
        const collectionItemInstance = getCollectionItemInstance(instance[field]);

        doesCollectionItemHaveAllBaseElements = checThatAllFragmentFieldsAreBaseElements(collectionItemInstance);
      }

      if (childConstructorName.includes(baseLibraryDescription.fragmentId)) {
        pathes[field] = {};

        const result = getPathToListIfExists(instance[field]);
        if (!result) {
          delete pathes[field];
        }

        if (result) {
          pathes[field] = result;
          return pathes;
        }
      } else if (isFieldCollection && isCollectionItemFragment && doesCollectionItemHaveAllBaseElements) {
        const collectionItemInstance = getCollectionItemInstance(instance[field]);

        const _action = getFragmentInteractionFields(collectionItemInstance);
        const _where = getFragmentTypes(collectionItemInstance, baseLibraryDescription.getDataMethod, 'resultType');
        const _visible = getFragmentTypes(
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
      } else if (isFieldCollection && isCollectionItemFragment) {
        // TODO need investigate how to handle collection in collection
      } else if (
        childConstructorName.includes(baseLibraryDescription.collectionId) &&
        baseElementsActionsDescription[instance[field][baseLibraryDescription.collectionItemId]?.name]
      ) {
        pathes[field] = {};

        const result = checkThatElementHasAction(
          instance[field][baseLibraryDescription.collectionItemId]?.name,
          baseLibraryDescription.getDataMethod,
        );

        if (!result) {
          delete pathes[field];
        }

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
