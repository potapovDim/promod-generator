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
    where: 'get',
    visible: 'isDisplayed'
    action: 'get',
    compare: 'get',
  },
  waitForVisibilityState: {
    where: 'get',
    visible: 'isDisplayed'
    action: 'isDisplayed',
    compare: 'isDisplayed',
  },
};

const collectionActionTypes = {
  get: {
    where: 'get',
    visible: 'isDisplayed',
    action: 'get',
  },
  isDisplayed: {
    where: 'get',
    visible: 'isDisplayed',
    action: 'isDisplayed',
  },
  sendKeys: {
    where: 'get',
    visible: 'isDisplayed',
    action: 'sendKeys',
  },
  click: {
    where: 'get',
    visible: 'isDisplayed',
    action: 'click',
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
  waitOptionsId: 'IWaitOpts',
  collectionActionId: 'ICollectionAction'
  collectionCheckId: 'ICollectionCheck',
  getDataMethod: 'get'
  getVisibilityMethod: 'isDisplayed'
};

module.exports = {
  baseElementsActionsDescription,
  pathToBase: 'lib',
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
