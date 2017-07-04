import { take, put, call, apply, race } from 'redux-saga/effects';
import { delay } from 'redux-saga'
import createChannel from './channels/message';
import browser from '../../common/browser';
import { getDatabaseHash, getCredentials } from './keepassNaCl';
import * as storage from '../../common/store';
import * as T from '../../common/actionTypes';

function* handleCredentials(action, port) {
  try {
    const { credentials, timeout } = yield race({
      credentials: call(getCredentials, action.payload),
      timeout: call(delay, 5000)
    });
    if (timeout) {
      throw new Error('Request timed out');
    }
    return credentials;
  } catch (error) {
    port.postMessage({
      action: T.GET_CREDENTIALS_FAILURE,
      payload: {
        message: error.message
      }
    });
  }
}

function* handleDbHash(port) {
  try {
    const hash = yield call(getDatabaseHash);
    port.postMessage({
      action: T.GET_DATABASE_HASH_SUCCESS,
      payload: hash
    });
  } catch (error) {
    port.postMessage({
      action: T.GET_DATABASE_HASH_FAILURE,
      payload: {
        code: error.code,
        message: error.message
      }
    });
  }
}

function* handleGetPluginVersion(port) {
  const version = browser.runtime.getManifest().version;
  port.postMessage({ type: T.GET_PLUGIN_VERSION_SUCCESS, payload: version });
}

function* handleGetSettings(port) {
  const settings = storage.getSettings();
  port.postMessage({ type: T.GET_SETTINGS_SUCCESS, payload: settings });
}

function* handleSetSettings(action) {
  storage.setSettings(Object.assign({}, storage.defaultSettings, action.payload));
}

export default function* tabSaga(port) {
  console.log(port.sender.tab);

  const channel = yield call(createChannel, port);

  try {
    while (true) {
      // take(END) will cause the saga to terminate by jumping to the finally block
      const action = yield take(channel);
      switch (action.type) {
        case T.GET_CREDENTIALS:
          yield call(handleCredentials, action, port);
          break;
        case T.GET_DATABASE_HASH:
          yield call(handleDbHash, port);
          break;
        case T.GET_PLUGIN_VERSION:
          yield call(handleGetPluginVersion, port);
          break;
        case T.GET_SETTINGS:
          yield call(handleGetSettings, port);
          break;
        case T.SET_SETTINGS:
          yield call(handleSetSettings, action);
          break;
        default:
          yield put(action); // just forward unrecognized message, might be handled somewhere else
          break;
      }
    }
  } finally {
    console.log('tabSaga terminated');
  }
}
