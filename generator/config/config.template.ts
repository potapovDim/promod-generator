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

const baseCollectionActionsDescription = {
  waitForContentState: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
      compare: { action: 'get', actionType: 'resultType' },
      generic: 'CollectionWaitingType',
    },
  },
  waitForVisibilityState: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
      compare: { action: 'isDisplayed', actionType: 'resultType' },
      generic: 'CollectionWaitingType',
    },
  },
  get: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
    resultType: {
      action: { action: 'get', actionType: 'resultType' },
      endType: '[]',
    },
  },
  isDisplayed: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
    resultType: {
      action: { action: 'isDisplayed', actionType: 'resultType' },
      endType: '[]',
    },
  },
  sendKeys: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'sendKeys', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
  },
  click: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'click', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
  },
  _where: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
    resultType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'get', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
  },
  _visible: {
    entryType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
      generic: 'CollectionActionType',
    },
    resultType: {
      where: { action: '_where', actionType: 'resultType' },
      visible: { action: '_visible', actionType: 'resultType' },
      action: { action: 'isDisplayed', actionType: 'entryType' },
      generic: 'CollectionActionType',
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
  collectionActionId: 'CollectionActionType',
  collectionCheckId: 'CollectionWaitingType',
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

const promod = {
  actionsDeclaration: 'declaration',
};

module.exports = {
  pathToBase: 'lib',
  promod,
  baseElementsActionsDescription,
  baseCollectionActionsDescription,
  systemPropsList,
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
