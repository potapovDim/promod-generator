/* eslint-disable sonarjs/no-nested-template-literals */
import { isObject, isArray, camelize } from 'sat-utils';
import { getConfiguration } from './config';
import { getPathesToCollections } from './get.fragments.for.random.getting';

function getFieldsEnumList(fieldsArr: string[]) {
  return fieldsArr.reduce((enumList, item, index, arr) => {
    const separator = index === arr.length - 1 ? '' : '|';
    return `${enumList} '${item}' ${separator}`;
  }, '');
}

function getPropPath(dataObj) {
  if (isObject(dataObj) && !('_where' in (dataObj as object))) {
    return `${Object.keys(dataObj)[0]} ${getPropPath(dataObj[Object.keys(dataObj)[0]])}`;
  }

  return '';
}

function finTypedObject(dataObj) {
  for (const value of Object.values(dataObj)) {
    if (isObject(value) && '_where' in (value as object)) {
      return value;
    }
    return finTypedObject(value);
  }
}

function getFlowEntryType(dataObj) {
  const typeName = `T${camelize(getPropPath(dataObj))}`;

  const { _action, _where, _visible } = finTypedObject(dataObj);

  const exectLikePart = `  except?: string | string[];
  like?: string | string[];
  _where?: ${_where}
  _visible?: ${_visible}`;

  return _action
    ? {
        typeName,
        type: `type ${typeName} = {
  field?: ${getFieldsEnumList(_action)};
${exectLikePart}
};`,
      }
    : {
        typeName,
        type: `type ${typeName} = {
${exectLikePart}
};`,
      };
}

function getReturnArgumentTemplate(dataObj) {
  return Object.keys(dataObj).reduce((template, key) => {
    if (isObject(dataObj[key]) && !('_where' in dataObj[key])) {
      return `${template} ${key}: ${getReturnArgumentTemplate(dataObj[key])} }`;
    } else if (isArray(dataObj[key])) {
      return `${template} ${key}: { _action: { [data.field]: null, _where: data._where, _visible: data._visible } } }`;
    } else {
      return `${template} ${key}: { _action: null, _where: data._where, _visible: data._visible } }`;
    }
  }, '{');
}

function getReturnTemplateAndLastKey(dataObj) {
  let lastKey;

  function getReturnTemplate(dataObj) {
    return Object.keys(dataObj).reduce((template, key) => {
      if (isObject(dataObj[key]) && !('_where' in dataObj[key])) {
        return `${template} ${key}: ${getReturnTemplate(dataObj[key])} }`;
      } else {
        lastKey = key;
        return `${template} ${key} }`;
      }
    }, '{');
  }
  const returnTemplate = getReturnTemplate(dataObj);

  return {
    returnTemplate,
    lastKey,
  };
}

function createFlowTemplates(asActorAndPage, dataObj) {
  const { baseLibraryDescription } = getConfiguration();

  const { type, typeName } = getFlowEntryType(dataObj);
  const { lastKey, returnTemplate } = getReturnTemplateAndLastKey(dataObj);
  const argumentTemplate = getReturnArgumentTemplate(dataObj);

  const name = camelize(`${asActorAndPage} get random data from ${getPropPath(dataObj)}`);

  return `\n
${type}
const ${name} = async function(data: ${typeName}): Promise<string> {
  const ${returnTemplate} = await page.${baseLibraryDescription.getDataMethod}(${argumentTemplate});

  const excludeValues = toArray(data.except);
  const includeValues = toArray(data.like);

  return getRandomArrayItem(
    ${lastKey}
      .map(item => item${type.includes('field?:') ? '[data.field]' : ''}.text)
      .filter(fieldText => !excludeValues.includes(fieldText))
      .filter(fieldText => (includeValues.length ? includeValues.some(item => fieldText.includes(item)) : true)),
  );
};\n`;
}

function getRandomResultsFlows(asActorAndPage, pageInstance) {
  const { systemPropsList } = getConfiguration();

  const pageFields = Object.getOwnPropertyNames(pageInstance);

  const interactionFields = pageFields.filter(field => !systemPropsList.includes(field));

  const randomResultData = interactionFields
    .filter(field => getPathesToCollections(pageInstance[field], field))
    .map(field => getPathesToCollections(pageInstance[field], field));

  return randomResultData.reduce((flows, dataObject) => {
    return `${flows}${createFlowTemplates(asActorAndPage, dataObject)}`;
  }, '');
}

export { getRandomResultsFlows };
