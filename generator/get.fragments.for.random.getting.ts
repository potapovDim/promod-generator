/* eslint-disable sonarjs/cognitive-complexity, no-console*/
import { getConfiguration } from './config';
import { checkThatElementHasAction } from './get.base.elements';
import { getFragmentTypes, getElementType } from './get.instance.elements.type';

function getFragmentInteractionFields(fragment) {
  const { systemPropsList } = getConfiguration();
  const fields = Object.getOwnPropertyNames(fragment);
  return fields.filter(item => !systemPropsList.includes(item));
}

function checThatAllFragmentFieldsAreBaseElements(fragment) {
  const { baseLibraryDescription } = getConfiguration();
  const interactionFields = getFragmentInteractionFields(fragment);

  return interactionFields.every(field =>
    checkThatElementHasAction(fragment[field].constructor.name, baseLibraryDescription.getDataMethod),
  );
}

function getPathesToCollections(fragmentInstance, name) {
  const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();

  function getPathToListIfExists(fragment) {
    const pathes = {};

    const fields = Object.getOwnPropertyNames(fragment);

    const interactionFields = fields.filter(item => !systemPropsList.includes(item));

    for (const field of interactionFields) {
      const childConstructorName = fragment[field].constructor.name;
      let doesCollectionItemHaveAllBaseElements;

      const isFieldCollection = childConstructorName.includes(baseLibraryDescription.collectionId);
      const isCollectionItemFragment = fragment[field][baseLibraryDescription.collectionItemId]?.name.includes(
        baseLibraryDescription.fragmentId,
      );

      if (isFieldCollection && isCollectionItemFragment) {
        doesCollectionItemHaveAllBaseElements = checThatAllFragmentFieldsAreBaseElements(
          new fragment[field][baseLibraryDescription.collectionItemId](
            fragment[field][baseLibraryDescription.rootLocatorId],
            fragment[field][baseLibraryDescription.entityId],
            fragment[field].rootElements.get(0),
          ),
        );
      }

      if (childConstructorName.includes(baseLibraryDescription.fragmentId)) {
        pathes[field] = {};

        const result = getPathToListIfExists(fragment[field]);
        if (!result) {
          delete pathes[field];
        }

        if (result) {
          pathes[field] = result;
          return pathes;
        }
      } else if (isFieldCollection && isCollectionItemFragment && doesCollectionItemHaveAllBaseElements) {
        const entity = new fragment[field][baseLibraryDescription.collectionItemId](
          fragment[field][baseLibraryDescription.rootLocatorId],
          fragment[field][baseLibraryDescription.entityId],
          fragment[field].rootElements.get(0),
        );
        const _action = getFragmentInteractionFields(entity);
        const _where = getFragmentTypes(entity, baseLibraryDescription.getDataMethod, 'resultType');
        const _visible = getFragmentTypes(entity, baseLibraryDescription.getVisibilityMethod, 'resultType');

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
        baseElementsActionsDescription[fragment[field][baseLibraryDescription.collectionItemId]?.name]
      ) {
        pathes[field] = {};

        const result = checkThatElementHasAction(
          fragment[field][baseLibraryDescription.collectionItemId]?.name,
          baseLibraryDescription.getDataMethod,
        );

        if (!result) {
          delete pathes[field];
        }

        if (result) {
          const _action = null;
          const _where = getElementType(
            new fragment[field][baseLibraryDescription.collectionItemId](
              fragment[field][baseLibraryDescription.rootLocatorId],
              fragment[field][baseLibraryDescription.entityId],
              fragment[field].rootElements.get(0),
            ),
            baseLibraryDescription.getDataMethod,
            'resultType',
          );
          const _visible = getElementType(
            new fragment[field][baseLibraryDescription.collectionItemId](
              fragment[field][baseLibraryDescription.rootLocatorId],
              fragment[field][baseLibraryDescription.entityId],
              fragment[field].rootElements.get(0),
            ),
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

  const result = getPathToListIfExists(fragmentInstance);

  if (result) return { [name]: result };
}

export { getPathesToCollections };
