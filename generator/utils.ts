const getAllBaseActions = baseElementsActionsDescription =>
  Array.from(
    new Set(
      Object.keys(baseElementsActionsDescription).flatMap(element =>
        Object.keys(baseElementsActionsDescription[element]),
      ),
    ).values(),
  );

export { getAllBaseActions };
