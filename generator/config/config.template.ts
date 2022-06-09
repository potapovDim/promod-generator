import * as fs from 'fs';
import * as path from 'path';

const template = `
const baseElementsActionsDescription = {
  Checkbox: {
    get: {
      entryType: 'Action',
      resultType: 'GetRes',
    },
    isDisplayed: {
      entryType: 'Action',
      resultType: 'IsDispRes',
    },
    sendKeys: {
      entryType: 'SendKeys',
    },
    waitForVisibilityState: {
      entryType: 'IsDispRes',
    },
    waitForContentState: {
      entryType: 'GetRes',
    },
    _where: {
      resultType: 'GetRes',
    },
    _visible: {
      resultType: 'IsDispRes',
    },
  },
  Input: {
    click: {
      entryType: 'Action',
    },
    get: {
      entryType: 'Action',
      resultType: 'GetRes',
    },
    isDisplayed: {
      entryType: 'Action',
      resultType: 'IsDispRes',
    },
    sendKeys: {
      entryType: 'SendKeys',
    },
    waitForVisibilityState: {
      entryType: 'IsDispRes',
    },
    waitForContentState: {
      entryType: 'GetRes',
    },
    _where: {
      resultType: 'GetRes',
    },
    _visible: {
      resultType: 'IsDispRes',
    },
  },
  Select: {
    get: {
      entryType: 'Action',
      resultType: 'GetRes',
    },
    isDisplayed: {
      entryType: 'Action',
      resultType: 'IsDispRes',
    },
    sendKeys: {
      entryType: 'SendKeys',
    },
    waitForVisibilityState: {
      entryType: 'IsDispRes',
    },
    waitForContentState: {
      entryType: 'GetRes',
    },
    _where: {
      resultType: 'GetRes',
    },
    _visible: {
      resultType: 'IsDispRes',
    },
  },
  Button: {
    click: {
      entryType: 'Action',
    },
    get: {
      entryType: 'Action',
      resultType: 'GetRes',
    },
    isDisplayed: {
      entryType: 'Action',
      resultType: 'IsDispRes',
    },
    waitForVisibilityState: {
      entryType: 'IsDispRes',
    },
    waitForContentState: {
      entryType: 'GetRes',
    },
    _where: {
      resultType: 'GetRes',
    },
    _visible: {
      resultType: 'IsDispRes',
    },
  },
  Text: {
    click: {
      entryType: 'Action',
    },
    get: {
      entryType: 'Action',
      resultType: 'GetRes',
    },
    isDisplayed: {
      entryType: 'Action',
      resultType: 'IsDispRes',
    },
    waitForVisibilityState: {
      entryType: 'IsDispRes',
    },
    waitForContentState: {
      entryType: 'GetRes',
    },
    _where: {
      resultType: 'GetRes',
    },
    _visible: {
      resultType: 'IsDispRes',
    },
  },
};

const collectionWaitingTypes = {
  waitForContentState: {
    where: { action: '_where', actionType: 'resultType' },
    visible: { action: '_visible', actionType: 'resultType' },
    action: { action: 'get', actionType: 'entryType' },
    compare: { action: 'get', actionType: 'resultType' },
  },
  waitForVisibilityState: {
    where: { action: '_where', actionType: 'resultType' },
    visible: { action: '_visible', actionType: 'resultType' },
    action: { action: 'isDisplayed', actionType: 'entryType' },
    compare: { action: 'isDisplayed', actionType: 'resultType' },
  },
};

const collectionActionTypes = {
  _where: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
    },
    resultType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
    },
  },
  _visible: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
    },
    resultType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
    },
  },
  get: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
    },
    resultType: {
      action: 'get',
      actionType: 'resultType',
      definitionType: '[]',
    },
  },
  isDisplayed: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
    },
    resultType: {
      action: 'isDisplayed',
      actionType: 'resultType',
      definitionType: '[]',
    },
  },
  sendKeys: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'sendKeys', actionType: 'entryType' },
    },
  },
  click: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'click', actionType: 'entryType' },
    },
  },
};

const systemPropsList = [
  'index',
  'rootLocator',
  'rootElements',
  'identifier',
  'InstanceType',
  'overrideElement',
  'parent',
  'loaderLocator',
  'rootElement',
];

const resultActionsMap = {
  click: 'void',
  get: 'resultType',
  isDisplayed: 'resultType',
  sendKeys: 'void',
  waitForVisibilityState: 'void',
  waitForContentState: 'void',
};

const actionWithWaitOpts = ['waitForVisibilityState', 'waitForContentState'];

const prettyMethodName = {
  isDisplayed: 'get Visibility of',
  get: 'get data from',
  sendKeys: 'set Values to',
};

const baseLibraryDescription = {
  entityId: 'identifier',
  rootLocatorId: 'rootLocator',
  pageId: 'Page',
  fragmentId: 'Fragment',
  collectionId: 'Collection',
  collectionItemId: 'InstanceType',
  collectionRootElementsId: 'rootElements',
  waitOptionsId: 'IWaitOpts',
  collectionActionId: 'ICollectionAction',
  collectionCheckId: 'ICollectionCheck',
  getDataMethod: 'get',
  getVisibilityMethod: 'isDisplayed',
  getBaseElementFromCollectionByIndex: 'get'
};

const collectionDescription = {
  action: '_action',
  where: '_where',
  visible: '_visible',
  index: 'index',
  length: 'length',
};

const ignoreGeneralActions = ['_where', '_visible'];

const promod = {
  actionsDeclaration: 'declaration',
};

module.exports = {
  pathToBase: 'lib',
  ignoreGeneralActions,
  promod,
  baseElementsActionsDescription,
  systemPropsList,
  collectionWaitingTypes,
  collectionActionTypes,
  resultActionsMap,
  actionWithWaitOpts,
  prettyMethodName,
  baseLibraryDescription,
  collectionDescription,
};
`;

function createTemplateConfig() {
  fs.writeFileSync(path.resolve(process.cwd(), './promod.generator.config.js'), template);
}

export { createTemplateConfig };
