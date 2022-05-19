import { getConfiguration } from './config';

function getAllBaseActions() {
  const { baseElementsActionsDescription } = getConfiguration();
  return Array.from(
    new Set(
      Object.keys(baseElementsActionsDescription).flatMap(element =>
        Object.keys(baseElementsActionsDescription[element]),
      ),
    ).values(),
  );
}

function getFragmentInteractionFields(instance) {
  const { systemPropsList } = getConfiguration();
  const instanceOwnKeys = Object.getOwnPropertyNames(instance);

  return instanceOwnKeys.filter(item => !systemPropsList.includes(item));
}

export { getAllBaseActions, getFragmentInteractionFields };
