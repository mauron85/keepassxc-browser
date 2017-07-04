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

const NATIVE_HOST_NAME = 'com.varjolintu.keepassxc_browser';

const actions = {
  GET_LOGINS: 'get-logins',
  GET_DATABASE_HASH: 'get-databasehash',
  CHANGE_PUBLIC_KEYS: 'change-public-keys',
  TEST_ASSOCIATE: 'test-associate'
};

let port;

function* changePublicKeys() {
  const { publicKey, secretKey } = getNewKeyPair();
  yield put({ type: T.NEW_KEY_PAIR, payload: { publicKey, secretKey } });
  const nonce = encodeBase64(getRandomNonce());
  port.postMessage({
    action: actions.CHANGE_PUBLIC_KEYS,
    publicKey: encodeBase64(publicKey),
    nonce
  });

  const response = yield take(actions.CHANGE_PUBLIC_KEYS);
  const {
    version,
    success,
    nonce: responseNonce,
    publicKey: publicKeyBase64
  } = response.payload;  

  if (!success || !publicKeyBase64) {
    yield put({ type: T.KEY_EXCHANGE_FAILED });
    throw new Error('Public key exchange failed');
  }

  if (!isNonceValid(decodeBase64(responseNonce))) {
    yield put({ type: T.KEY_EXCHANGE_FAILED });
    throw new Error('Public key exchange failed because of invalid nonce');
  }
  
  if (responseNonce !== nonce ) {
    yield put({ type: T.KEY_EXCHANGE_FAILED });
    throw new Error('Public key exchange failed because nonce differ');   
  }

  // const nonce = decodeBase64(nonceBase64);
  const serverPublicKey = decodeBase64(publicKeyBase64);
  yield put({ type: T.NEW_SERVER_PUBLIC_KEY, payload: serverPublicKey });

  return serverPublicKey;
}

export function* getDatabaseHash() {
  port.postMessage({ action: actions.GET_DATABASE_HASH });
  const response = yield take(actions.GET_DATABASE_HASH);
  const { error: errorMessage, errorCode, hash } = response.payload;
  if (errorCode) {
    const error = new Error(
      `Error getting database hash. Message: ${errorMessage} Code: ${errorCode}`
    );
    // error.code = errorCode;
    yield put({ type: T.GET_DATABASE_HASH_FAILURE, payload: error });
    throw error;
  }
  return hash;
}

export function* testAssociation(dbHash) {
  const state = yield select();
  const { associatedDatabases, secretKey, serverPublicKey } = state;
  const { id = null, key = null } = associatedDatabases[dbHash] || {};
  if (!(id && key)) {
    const error = new Error('Not associated with opened db');
    // error.code = errorCode;
    yield put({ type: 'NOT_ASSOCIATED_ERROR', payload: error });
    // throw error;
    return false;
  }
  const requestMessage = {
    action: actions.TEST_ASSOCIATE,
    id: id,
    key: key
  };
  const nonce = getRandomNonce();
  const request = {
    action: actions.TEST_ASSOCIATE,
    message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
    nonce: encodeBase64(nonce)
  };

  port.postMessage({
    action: actions.TEST_ASSOCIATE,
    message: request
  });

  // wait for response;
  const { payload } = yield take(actions.TEST_ASSOCIATE);
  let responseMessageUint8Array = decrypt(
    payload.message,
    payload.nonce,
    serverPublicKey,
    secretKey
  );
  if (!responseMessageUint8Array) {
    const error = 'Failed to decrypt message';
    yield put({ type: 'DECRYPT_ERROR', payload: error });
    // throw error;
    return false;
  }
  const responseMessage = JSON.parse(encodeUTF8(responseMessageUint8Array));
  return (
    responseMessage.success == 'true' &&
    isNonceValid(decodeBase64(payload.nonce)) &&
    responseMessage.id === id
  );
}

export function* getCredentials() {
  try {
    const { serverPublicKey } = yield select();
    if (!serverPublicKey) {
      yield call(changePublicKeys);
    }
    const dbHash: string = yield call(getDatabaseHash);
    const isAssociated = yield call(testAssociation, dbHash);
    if (!isAssociated) {
      throw new Error('Not associated with opened db');
    }
  } catch (error) {
    throw error;
  }
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
