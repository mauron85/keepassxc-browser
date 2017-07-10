import { take, put, call, apply, select } from 'redux-saga/effects';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8
} from 'tweetnacl-util';
import {
  getNewKeyPair,
  getRandomNonce,
  encrypt,
  decrypt,
  isNonceValid
} from './helpers';
import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';
import * as storage from '../../common/store';
import { postMessage } from '../sagas/nativeClient';

const browser = getBrowser();

const actions = {
  GET_LOGINS: 'get-logins',
  GET_DATABASE_HASH: 'get-databasehash',
  CHANGE_PUBLIC_KEYS: 'change-public-keys',
  ASSOCIATE: 'associate',
  TEST_ASSOCIATE: 'test-associate'
};

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
  const request = {
    action: actions.CHANGE_PUBLIC_KEYS,
    publicKey: encodeBase64(publicKey),
    nonce: nonceBase64
  };

  const {
    version,
    success,
    nonce: responseNonce,
    publicKey: publicKeyBase64
  } = yield call(postMessage, request);

  if (!success || !publicKeyBase64) {
    throw new Error('Public key exchange failed');
  }

  if (responseNonce !== nonceBase64) {
    throw new Error('Public key exchange failed because nonce differ');
  }

  const serverPublicKey = decodeBase64(publicKeyBase64);
  yield put({
    type: T.SET_NEW_KEYS,
    payload: { secretKey, publicKey, serverPublicKey }
  });

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

function* isAssociated(dbHash: string) {
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

  const request = {
    action: actions.TEST_ASSOCIATE,
    message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
    nonce: nonceBase64
  };
  const response = yield call(postMessage, request);

  // wait for response;
  const responseMessage = yield call(getDecryptedMessage, response);
  return (
    responseMessage.success == 'true' &&
    responseMessage.nonce === nonceBase64 &&
    responseMessage.id === id
  );
}

export function* getDatabaseHash() {
  const request = { action: actions.GET_DATABASE_HASH };
  const response = yield call(postMessage, request);
  const { error: errorMessage, errorCode, hash } = response;
  if (errorCode) {
    const error = new Error(
      `Error getting database hash. Message: ${errorMessage} Code: ${errorCode}`
    );
    yield put({ type: T.GET_DATABASE_HASH_FAILURE, payload: error });
    throw error;
  }
  return hash;
}

export function* associate() {
  try {
    const { publicKey, secretKey, serverPublicKey } = yield call(getKeys);

    const nonce = getRandomNonce();
    const nonceBase64 = encodeBase64(nonce);
    const key = encodeBase64(publicKey);
    const requestMessage = { action: actions.ASSOCIATE, key };

    const request = {
      action: actions.ASSOCIATE,
      message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
      nonce: nonceBase64
    };
    const response = yield call(postMessage, request);
    const responseMessage = yield call(getDecryptedMessage, response);

    if (
      !(
        responseMessage.success == 'true' &&
        responseMessage.nonce === nonceBase64
      )
    ) {
      throw new Error('KeePassXC association failed');
    }

    return {
      key: key,
      id: responseMessage.id,
      hash: responseMessage.hash
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function* getCredentials(origin, formUrl) {
  const { serverPublicKey, secretKey } = yield call(getKeys);
  const dbHash: string = yield call(getDatabaseHash);
  const isDbAssociated = yield call(isAssociated, dbHash);
  if (!isDbAssociated) {
    throw new Error('Not associated with opened db');
  }

  const nonce = getRandomNonce();
  const nonceBase64 = encodeBase64(nonce);

  const requestMessage = {
    id: dbHash,
    url: origin,
    submiturl: formUrl
  };

  const request = {
    action: actions.GET_LOGINS,
    message: encrypt(requestMessage, nonce, serverPublicKey, secretKey),
    nonce: encodeBase64(nonce)
  };
  const response = yield call(postMessage, request);
  const responseMessage = yield call(getDecryptedMessage, response);

  if (
    !(
      responseMessage.success == 'true' && responseMessage.nonce === nonceBase64
    )
  ) {
    throw new Error('KeePassXC getting credentials failed');
  }

  return responseMessage.entries;
}
