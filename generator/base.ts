const allBaseElements = new Set([
  'Checkbox',
  'Input',
  'Radio',
  'Select',
  'Toggle',

  'Button',
  'Image',
  'Link',
  'Tab',
  'Text',
]);
const sendKeysElement = new Set(['Input', 'Checkbox', 'Select', 'Toggle']);
const clickElements = new Set(['Button', 'Image', 'Link', 'Tab', 'Text']);

const systemProps = new Set([
  'index',
  'rootLocator',
  'rootElements',
  'identifier',
  'InstanceType',
  'overrideElement',
  'parent',
  'loaderLocator',
  'rootElement',
]);

const baseActionToTypeMap = {
  click: 'Action',
  get: 'Action',
  scrollTo: 'Action',
  isDisplayed: 'Action',
  sendKeys: 'SendKeys',
  waitForVisibilityState: 'Visibility',
  waitForContentState: 'Content',
};
const baseResultActionTypeMap = {
  click: 'void',
  scrollTo: 'void',
  get: 'GetRes',
  isDisplayed: 'IsDispRes',
  sendKeys: 'void',
  waitForVisibilityState: 'void',
  waitForContentState: 'void',
};

const pathToLibrary = 'lib';

export {
  allBaseElements,
  sendKeysElement,
  clickElements,
  systemProps,
  pathToLibrary,
  baseActionToTypeMap,
  baseResultActionTypeMap,
};
