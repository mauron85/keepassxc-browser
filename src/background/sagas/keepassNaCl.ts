import { take, put, call, apply, select } from 'redux-saga/effects';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8
} from 'tweetnacl-util';
import createChannel from './channels/message';
import browser from '../../common/browser';
import {
  getNewKeyPair,
  getRandomNonce,
  encrypt,
  decrypt,
  isNonceValid
} from '../keepass';
import * as T from '../../common/actionTypes';
import * as storage from '../../common/store';

const NATIVE_HOST_NAME = 'com.varjolintu.keepassxc_browser';

const actions = {
  GET_LOGINS: 'get-logins',
  GET_DATABASE_HASH: 'get-databasehash',
  CHANGE_PUBLIC_KEYS: 'change-public-keys',
  ASSOCIATE: 'associate',
  TEST_ASSOCIATE: 'test-associate'
};

let port;

function* getDecryptedMessage(payload) {
  const state = yield select();
  const { secretKey, serverPublicKey } = state.keys;

  const responseMessageUint8Array = decrypt(
    payload.message,
    payload.nonce,
    serverPublicKey,
    secretKey
  );

  if (!responseMessageUint8Array) {
    throw new Error('Failed to decrypt message');
  }

  return JSON.parse(encodeUTF8(responseMessageUint8Array));
}

function* changePublicKeys() {
  yield put({ type: T.INVALIDATE_KEYS });
  const { publicKey, secretKey } = getNewKeyPair();
  const nonceBase64 = encodeBase64(getRandomNonce());
  port.postMessage({
    action: actions.CHANGE_PUBLIC_KEYS,
    publicKey: encodeBase64(publicKey),
    nonce: nonceBase64
  });

  const { payload } = yield take(actions.CHANGE_PUBLIC_KEYS);
  const {
    version,
    success,
    nonce: responseNonce,
    publicKey: publicKeyBase64
  } = payload;  

  if (!success || !publicKeyBase64) {
    throw new Error('Public key exchange failed');
  }
 
  if (responseNonce !== nonceBase64 ) {
    throw new Error('Public key exchange failed because nonce differ');   
  }

  const serverPublicKey = decodeBase64(publicKeyBase64);
  yield put({ type: T.SET_NEW_KEYS, payload: { secretKey, publicKey, serverPublicKey } });

  return { secretKey, publicKey, serverPublicKey };
}

function* getKeys() {
  const state = yield select();
  let { secretKey, publicKey, serverPublicKey } = state.keys;

  if (!(secretKey && publicKey && serverPublicKey)) {
    return yield call(changePublicKeys);
  }

  return { secretKey, publicKey, serverPublicKey };
}

export function* getDatabaseHash() {
  port.postMessage({ action: actions.GET_DATABASE_HASH });
  const response = yield take(actions.GET_DATABASE_HASH);
  const { error: errorMessage, errorCode, hash } = response.payload;
  if (errorCode) {
    const error = new Error(
      `Error getting database hash. Message: ${errorMessage} Code: ${errorCode}`
    );
    yield put({ type: T.GET_DATABASE_HASH_FAILURE, payload: error });
    throw error;
  }
  return hash;
}

export function* testAssociation(dbHash) {
  const { secretKey, serverPublicKey } = yield call(getKeys);
  const associatedDatabases = storage.getAssociatedDatabases();
  const { id = null, key = null } = associatedDatabases[dbHash] || {};
  if (!(id && key)) {
    const error = new Error('Not associated with opened db');
    yield put({ type: 'NOT_ASSOCIATED_ERROR', payload: error });
    return false;
  }

  const nonce = getRandomNonce();
  const nonceBase64 = encodeBase64(nonce);
   const requestMessage = {
    action: actions.TEST_ASSOCIATE,
    id: id,
    key: key
  };

  port.postMessage({
    action: actions.TEST_ASSOCIATE,
    message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
    nonce: nonceBase64
  });

  // wait for response;
  const { payload } = yield take(actions.TEST_ASSOCIATE);
  const responseMessage = yield call(getDecryptedMessage, payload);
  return (
    responseMessage.success == 'true' &&
    responseMessage.nonce === nonceBase64 &&
    responseMessage.id === id
  );
}

export function* associate() {
  const { publicKey, secretKey, serverPublicKey } = yield call(getKeys);

  const nonce = getRandomNonce();
  const nonceBase64 = encodeBase64(nonce);
  const key = encodeBase64(publicKey);
  const requestMessage = { action: actions.ASSOCIATE, key };

  port.postMessage({
    action: actions.ASSOCIATE,
    message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
    nonce: nonceBase64
  });

  const { payload } = yield take(actions.ASSOCIATE);
  const responseMessage = yield call(getDecryptedMessage, payload);

  if (!(
    responseMessage.success == 'true' &&
    responseMessage.nonce === nonceBase64
  )) {
    throw new Error('KeePassXC association failed');
  }

  return {
    key: key,
    id: responseMessage.id,
    hash: responseMessage.hash
  };
}

export function* getCredentials({ origin, formUrl }) {
  const { serverPublicKey, secretKey } = yield call(getKeys);
  const dbHash: string = yield call(getDatabaseHash);
  const isAssociated = yield call(testAssociation, dbHash);
  if (!isAssociated) {
    throw new Error('Not associated with opened db');
  }

  const nonce = getRandomNonce();
  const nonceBase64 = encodeBase64(nonce);

  const requestMessage = {
    id: dbHash,
    url: origin,
    submiturl: formUrl
  };  

  port.postMessage({
    action: actions.GET_LOGINS,
    message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
    nonce: encodeBase64(nonce)
  });

  const { payload } = yield take(actions.GET_LOGINS);
  const responseMessage = yield call(getDecryptedMessage, payload);

  if (!(
    responseMessage.success == 'true' &&
    responseMessage.nonce === nonceBase64
  )) {
    throw new Error('KeePassXC getting credentials failed');
  }

  return responseMessage.entries;
}

export default function* keepassNativeClientSaga() {
  port = browser.runtime.connectNative(NATIVE_HOST_NAME);
  const channel = yield call(createChannel, port);
  try {
    while (true) {
      // take(END) will cause the saga to terminate by jumping to the finally block
      const msg = yield take(channel);
      yield put({ type: msg.action, payload: msg });
    }
  } finally {
    console.log('keepassNativeClientSaga terminated');
  }
}
