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
  },
  Input: {
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
  },
  Radio: {
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
  },
  Toggle: {
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
  },
  Image: {
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
  },
  Link: {
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
  },
  Tab: {
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
  },
};

const collectionWaitingTypes = {
  waitForContentState: {
    where: { action: 'waitForContentState', type: 'entryType' },
    visible: { action: 'waitForVisibilityState', type: 'entryType' },
    action: { action: 'get', type: 'entryType' },
    compare: { action: 'get', type: 'resultType' },
  },
  waitForVisibilityState: {
    where: { action: 'waitForContentState', type: 'entryType' },
    visible: { action: 'waitForVisibilityState', type: 'entryType' },
    action: { action: 'isDisplayed', type: 'entryType' },
    compare: { action: 'isDisplayed', type: 'resultType' },
  },
};

const collectionActionTypes = {
  get: {
    where: { action: 'waitForContentState', type: 'entryType' },
    visible: { action: 'waitForVisibilityState', type: 'entryType' },
    action: { action: 'get', type: 'entryType' },
  },
  isDisplayed: {
    where: { action: 'waitForContentState', type: 'entryType' },
    visible: { action: 'waitForVisibilityState', type: 'entryType' },
    action: { action: 'isDisplayed', type: 'entryType' },
  },
  sendKeys: {
    where: { action: 'waitForContentState', type: 'entryType' },
    visible: { action: 'waitForVisibilityState', type: 'entryType' },
    action: { action: 'sendKeys', type: 'entryType' },
  },
  click: {
    where: { action: 'waitForContentState', type: 'entryType' },
    visible: { action: 'waitForVisibilityState', type: 'entryType' },
    action: { action: 'click', type: 'entryType' },
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

const promod = {
  actionsDeclaration: 'declaration',
};

module.exports = {
  pathToBase: 'lib',
  promod,
  baseElementsActionsDescription,
  systemPropsList,
  collectionWaitingTypes,
  collectionActionTypes,
  resultActionsMap,
  actionWithWaitOpts,
  prettyMethodName,
  baseLibraryDescription,
};
`;

function createTemplateConfig() {
  fs.writeFileSync(path.resolve(process.cwd(), './promod.generator.config.js'), template);
}

export { createTemplateConfig };
