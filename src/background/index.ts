/* globals window */
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { contextMenu } from './contextMenu';
import getBrowser from '../common/browser';
import * as storage from '../common/store';
import rootReducer from './reducers';
import rootSaga from './sagas';
import * as T from '../common/actionTypes';

const browser = getBrowser();

/** 
 * Create contextMenu from template
 * when menu item is clicked we'are sending message with defined action
 * to content_script message handler
 */
if (Array.isArray(contextMenu)) {
  const actions = {};
  contextMenu.forEach(({ id, title, contexts, actionName }) => {
    browser.contextMenus.create({ id, title, contexts });
    actions[id] = actionName;
  });
  browser.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId } = info;
    const actionName = actions[menuItemId];
    if (!actionName) {
      return false;
    }
    browser.tabs.sendMessage(tab.id, { info, action: actionName });
    return true;
  });
}

/**
 * Listen for keyboard shortcuts specified by user
 */
browser.commands.onCommand.addListener(command => {
  // as defined in manifest
  switch (command) {
    case 'fill_username_password':
      browser.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: T.FILL_USERNAME_PASSWORD
          });
        }
      });
      break;
    case 'fill_password':
      browser.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          browser.tabs.sendMessage(tabs[0].id, { action: T.FILL_PASSWORD });
        }
      });
      break;
    default:
      return false;
  }

  return true;
});

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case T.GET_SETTINGS:
      sendResponse(storage.getSettings());
      return true;
    default:
      return false;
  }
});

const preloadedState = {
  associatedDatabases: storage.getAssociatedDatabases() // sets reducer initial state
};

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  rootReducer,
  preloadedState,
  applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(rootSaga);

