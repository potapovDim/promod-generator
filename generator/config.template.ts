import * as fs from 'fs';
import * as path from 'path';

const template = `
const actionWithWaitOpts = new Set(['waitForVisibilityState', 'waitForContentState']);
const baseElementActions = {
  click: 'Action',
  get: 'Action',
  isDisplayed: 'Action',
  sendKeys: 'SendKeys',
};
const actionToTypeMap = {
  click: 'Action',
  get: 'Action',
  isDisplayed: 'Action',
  sendKeys: 'SendKeys',
  waitForVisibilityState: 'Visibility',
  waitForContentState: 'Content',
};
const resultActionsMap = {
  click: 'void',
  get: 'GetRes',
  isDisplayed: 'IsDispRes',
  sendKeys: 'void',
  waitForVisibilityState: 'void',
  waitForContentState: 'void',
};

const baseElementsList = new Set([
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
  'DropSearchMultiSelect',
  'DatePicker',
]);
const baseElementsWithSendKeysAction = new Set([
  'Input',
  'Checkbox',
  'Select',
  'Toggle',
  'DropSearchMultiSelect',
  'DatePicker',
]);

const clickElements = new Set(['Button', 'Image', 'Link', 'Tab', 'Text']);
const systemPropsList = new Set([
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

module.exports = {
  baseElementsList,

  clickElements,
  sendKeysElements: baseElementsWithSendKeysAction,
  getElements: baseElementsList,
  isDisplayedElements: baseElementsList,
  waitForVisibilityStateElements: baseElementsList,
  waitForContentStateElements: baseElementsList,

  actionWithWaitOpts,
  systemPropsList,
  baseElementActions,
  actionToTypeMap,
  resultActionsMap,

  pathToBase: 'lib',
};
`;

function createTemplateConfig() {
  fs.writeFileSync(path.resolve(process.cwd(), './promod.generator.config.js'), template);
}

export { createTemplateConfig };
