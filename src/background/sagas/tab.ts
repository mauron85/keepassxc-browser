import { take, put, call, apply } from 'redux-saga/effects';
import createChannel from './channels/portMessage';
import * as storage from '../../common/store';
import getKeepassInstance, {
  NATIVE_CLIENT,
  HTTP_CLIENT
} from '../keepass/factory';
import * as T from '../../common/actionTypes';

const { clientType } = storage.getSettings();
let keepass = getKeepassInstance(clientType) as any;

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
    const credentials = yield call(
      [keepass, 'getCredentials'],
      origin,
      formAction
    );
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
    const hash = yield call([keepass, 'getDatabaseHash']);
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
  const newSettings = action.payload;
  const currentSettings = storage.getSettings();
  storage.setSettings(newSettings);
  if (newSettings.clientType !== currentSettings.clientType) {
    keepass = getKeepassInstance(newSettings.clientType);
  }
}

function* handleSetAssociatedDatabases(action) {
  storage.setAssociatedDatabases(action.payload);
}

function* handleAssociate() {
  try {
    yield call([keepass, 'getDatabaseHash']); // test connect
    const { id, key, hash } = yield call([keepass, 'associate']);
    storage.addAssociatedDatabase(id, key, hash);
    yield put({ type: T.ASSOCIATE_SUCCESS });
    return {
      type: T.ASSOCIATE_SUCCESS
    };
  } catch (error) {
    return {
      type: T.ASSOCIATE_FAILURE,
      payload: errorToJSON(error)
    };
  }
}

function* handleTestConnect() {
  try {
    const hash = yield call([keepass, 'getDatabaseHash']);
    return {
      type: T.TEST_CONNECT_SUCCESS
    };
  } catch (error) {
    return {
      type: T.TEST_CONNECT_FAILURE,
      payload: errorToJSON(error)
    };
  }
}

function* handleGetStatus() {
  try {
    const hash = yield call([keepass, 'getDatabaseHash']);
    const isDbAssociated = yield call([keepass, 'isAssociated'], hash);
    return {
      type: T.GET_STATUS_SUCCESS,
      payload: {
        status: isDbAssociated ? 'ASSOCIATED' : 'NOT_ASSOCIATED'
      }
    };
  } catch (error) {
    return {
      type: T.GET_STATUS_SUCCESS,
      payload: { status: 'NOT_AVAILABLE' }
    };
  }
}

export function* getDatabaseHash() {
  return yield call([keepass, 'getDatabaseHash']);
}

export function* isAssociated(hash) {
  return yield call([keepass, 'isAssociated'], hash);
}

export default function* tabSaga(port) {
  const channel = yield call(createChannel, port);

  try {
    while (true) {
      // take(END) will cause the saga to terminate by jumping to the finally block
      let msg;
      const action = yield take(channel);
      // const { autoRetrieveCredentials, autoCompleteUsernames } = storage.getSettings();
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
        case T.TEST_CONNECT:
          msg = yield call(handleTestConnect);
          break;
        case T.GET_STATUS:
          msg = yield call(handleGetStatus);
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
