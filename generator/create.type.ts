// TODO actions list more flexible way
import { getConfiguration } from './config';

function createType(
  itemObject: Array<{ [k: string]: { [k: string]: string } }> | { [k: string]: string },
  action = 'Action',
) {
  const { actions } = getConfiguration();

  const isObjectWithAction = Object.keys(itemObject).every(key => actions.has(key));

  if (isObjectWithAction) {
    return `${itemObject[action]}\n`;
  }

  const actionForType =
    action === 'SendKeys'
      ? (itemObject as any).filter(fieldDescriptor => {
          const baseElementType = Object.values(fieldDescriptor)[0];

          return baseElementType[action];
        })
      : itemObject;

  return actionForType.reduce((typeString, fieldDescriptor, index, initialArr) => {
    const field = Object.keys(fieldDescriptor)[0];

    return (
      typeString +
      (index === initialArr.length - 1
        ? `\n ${field}?: ${fieldDescriptor[field][action]}\n}`
        : `\n ${field}?: ${fieldDescriptor[field][action]}`)
    );
  }, '{');
}

export { createType };
