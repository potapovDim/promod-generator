/* eslint-disable sonarjs/cognitive-complexity, no-console*/
import { getConfiguration } from './config';
import { checkThatElementHasAction } from './get.base.elements';

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
  function getPathToListIfExists(fragment) {
    const { systemPropsList, baseElementsActionsDescription, baseLibraryDescription } = getConfiguration();
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
        pathes[field] = getFragmentInteractionFields(
          new fragment[field][baseLibraryDescription.collectionItemId](
            fragment[field][baseLibraryDescription.rootLocatorId],
            fragment[field][baseLibraryDescription.entityId],
            fragment[field].rootElements.get(0),
          ),
        );

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
          pathes[field] = null;
          return pathes;
        }
      }
    }
  }

  const result = getPathToListIfExists(fragmentInstance);

  if (result) return { [name]: result };
}

export { getPathesToCollections };
