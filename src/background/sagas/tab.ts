import { take, put, call, apply, race } from 'redux-saga/effects';
import { delay } from 'redux-saga'
import createChannel from './channels/message';
import browser from '../../common/browser';
import * as storage from '../../common/store';
import getKeepassInstance, { NATIVE_CLIENT, HTTP_CLIENT } from '../keepass/factory';
import * as T from '../../common/actionTypes';

let keepass = getKeepassInstance(HTTP_CLIENT);

function errorToJSON(error) {
  return {
    code: error.code,
    message: error.message,
    stack: error.stack
  };
}

function* handleGetCredentials(action) {
  try {
    const { origin, formAction } = action.payload;
    const { credentials, timeout } = yield race({
      credentials: call([keepass, 'getCredentials'],origin, formAction),
      timeout: call(delay, 5000)
    });
    if (timeout) {
      throw new Error('Request timed out');
    }
    return {
      type: T.GET_CREDENTIALS_SUCCESS,
      payload: credentials
    };
  } catch (error) {
    return {
      type: T.GET_CREDENTIALS_FAILURE,
      payload: errorToJSON(error)
    };
  }
}

function* handleGetDbHash() {
  try {
    const hash = yield call([keepass ,'getDatabaseHash']);
    return {
      type: T.GET_DATABASE_HASH_SUCCESS,
      payload: hash
    };
  } catch (error) {
    return {
      type: T.GET_DATABASE_HASH_FAILURE,
      payload: errorToJSON(error)
    };
  }
}

function* handleSetSettings(action) {
  storage.setSettings(Object.assign({}, storage.defaultSettings, action.payload));
}

function* handleSetAssociatedDatabases(action) {
  storage.setAssociatedDatabases(action.payload);
}

function* handleAssociate() {
  try {
    const { id, key, hash } = yield call([keepass, 'associate']);
    storage.addAssociatedDatabase(id, key, hash);
    return {
      type: T.ASSOCIATE_SUCCESS
    };   
  } catch(error) {
    return {
      type: T.ASSOCIATE_FAILURE,
      payload: errorToJSON(error)
    };
  }
}

export default function* tabSaga(port) {
  console.log(port.sender.tab);

  const channel = yield call(createChannel, port);

  try {
    while (true) {
      // take(END) will cause the saga to terminate by jumping to the finally block
      let msg;
      const action = yield take(channel);
      switch (action.type) {
        case T.GET_CREDENTIALS:
          msg = yield call(handleGetCredentials, action);
          break;
        case T.GET_DATABASE_HASH:
          msg = yield call(handleGetDbHash);
          break;
        case T.ASSOCIATE:
          msg = yield call(handleAssociate);
          break;
        case T.SET_SETTINGS:
          yield call(handleSetSettings, action);
          break;
        case T.SET_ASSOCIATED_DATABASES:
          yield call(handleSetAssociatedDatabases, action);
          break;
        default:
          break;
      }
      if (msg) {
        port.postMessage(msg);
      }
    }
  } finally {
    console.log('tabSaga terminated');
  }
}
