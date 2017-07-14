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
 */
if (Array.isArray(contextMenu)) {
  const actions = {};
  contextMenu.forEach(({ id, title, contexts, actionName }) => {
    browser.contextMenus.create({ id, title, contexts });
    actions[id] = actionName;
  });
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case T.GET_SETTINGS:
      sendResponse(storage.getSettings());
      return true;
    case T.GET_KEEPASSXC_VERSION:
      // TODO
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

