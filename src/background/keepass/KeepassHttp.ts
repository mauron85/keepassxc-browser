/* globals fetch */
import slowAES from './vendor/aes';
import { decodeUTF8 } from './vendor/utf8.js';
import { Keepass, KeepassCredentials, KeepassAssociation } from './Keepass';
import * as storage from '../../common/store';

const KEY_SIZE = 8;
const DEFAULT_KEEPASSXC_URL = 'http://localhost:19455';

const actions = {
  GET_LOGINS: 'get-logins',
  GET_DATABASE_HASH: 'test-associate',
  CHANGE_PUBLIC_KEYS: 'change-public-keys',
  ASSOCIATE: 'associate',
  TEST_ASSOCIATE: 'test-associate'
};

function postRequest(url, request) {
  return fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(request)
  }).then(response => {
    if (!response.ok) {
      throw new Error('Response not ok');
    }
    return response.json();
  });
}

function getRandom(min, max) {
  if (min === null) min = 0;
  if (max === null) max = 1;
  return Math.floor(Math.random() * (max + 1)) + min;
}

function getRandomNonce(keySize) {
  if (keySize === null) keySize = 16;
  var key = [];
  for (var i = 0; i < keySize * 2; i++) key.push(getRandom(0, 255));
  return key;
}

function convertByteArrayToString(byteArray) {
  var s = '';
  for (var i = 0; i < byteArray.length; i++) {
    s += String.fromCharCode(byteArray[i]);
  }
  return s;
}

function convertStringToByteArray(s) {
  var byteArray = [];
  for (var i = 0; i < s.length; i++) {
    byteArray.push(s.charCodeAt(i));
  }
  return byteArray;
}

function encodeBase64(d) {
  return btoa(convertByteArrayToString(d));
}

function decodeBase64(d) {
  return convertStringToByteArray(atob(d));
}

function encrypt(input, key, iv) {
  return encodeBase64(
    slowAES.encrypt(input, slowAES.modeOfOperation.CBC, key, iv)
  );
}

function decrypt(input, key, iv) {
  var output = slowAES.decrypt(input, slowAES.modeOfOperation.CBC, key, iv);

  return convertByteArrayToString(output);
}

function decryptEntry(e, key, iv) {
  const uuid = decrypt(decodeBase64(e.Uuid), key, iv);
  const name = decodeUTF8(decrypt(decodeBase64(e.Name), key, iv));
  const login = decodeUTF8(decrypt(decodeBase64(e.Login), key, iv));
  const password = decodeUTF8(decrypt(decodeBase64(e.Password), key, iv));
  const stringFields = {};

  if (e.StringFields) {
    for (var i = 0; i < e.StringFields.length; i++) {
      stringFields[i].Key = decodeUTF8(
        decrypt(decodeBase64(e.StringFields[i].Key), key, iv)
      );
      stringFields[i].Value = decodeUTF8(
        decrypt(decodeBase64(e.StringFields[i].Value), key, iv)
      );
    }
  }
  return { uuid, name, login, password, stringFields };
}

export default class KeepassHttp implements Keepass {
  private getAssociation(dbHash) {
    const associatedDatabases = storage.getAssociatedDatabases();
    const assocDb = associatedDatabases[dbHash];
    if (assocDb) {
      const { id, key } = assocDb;
      return { id, key: decodeBase64(key) };
    }
    return null;
  }

  private getUrl() {
    const { port } = storage.getSettings();
    return `http://localhost:${port}`;
  }

  async getDatabaseHash(): Promise<string> {
    const request = {
      RequestType: actions.GET_DATABASE_HASH,
      TriggerUnlock: false
    };

    const response = await postRequest(this.getUrl(), request);
    return response.Hash;
  }

  async getCredentials(
    origin: string,
    formAction: string
  ): Promise<KeepassCredentials[]> {
    const dbHash = await this.getDatabaseHash();
    const isAssociated = await this.isAssociated(dbHash);
    if (!isAssociated) {
      throw new Error('Not associated with opened db');
    }
    const { id, key } = this.getAssociation(dbHash);
    const nonce = getRandomNonce(KEY_SIZE);
    const nonceBase64 = encodeBase64(nonce);

    const request: any = {
      RequestType: actions.GET_LOGINS,
      SortSelection: 'true',
      TriggerUnlock: false,
      Id: id,
      Nonce: nonceBase64,
      Verifier: encrypt(convertStringToByteArray(nonceBase64), key, nonce),
      Url: encrypt(convertStringToByteArray(origin), key, nonce)
    };

    if (formAction) {
      request.SubmitUrl = encrypt(
        convertStringToByteArray(formAction),
        key,
        nonce
      );
    }

    const response = await postRequest(this.getUrl(), request);
    if (!response.Success) {
      throw new Error('KeePassXC getting credentials failed');
    }
    const responseNonse = decodeBase64(response.Nonce);
    const decryptedNonce = decrypt(
      decodeBase64(response.Verifier),
      key,
      responseNonse
    );
    if (!(decryptedNonce === response.Nonce && response.Id === id)) {
      throw new Error('KeePassXC getting credentials failed');
    }

    if (!Array.isArray(response.Entries) || response.Entries.length === 0) {
      return [];
    }

    return response.Entries.map(entry => {
      return decryptEntry(entry, key, responseNonse);
    });
  }

  async associate(): Promise<KeepassAssociation> {
    const rawKey = getRandomNonce(KEY_SIZE * 2);
    const key = encodeBase64(rawKey);
    const nonce = getRandomNonce(KEY_SIZE);
    const nonceBase64 = encodeBase64(nonce);
    const request = {
      RequestType: actions.ASSOCIATE,
      Key: key,
      Nonce: nonceBase64,
      Verifier: encrypt(convertStringToByteArray(nonceBase64), rawKey, nonce)
    };
    const response = await postRequest(this.getUrl(), request);
    if (!response.Success) {
      throw new Error('KeePassXC association failed');
    }
    const decryptedNonce = decrypt(
      decodeBase64(response.Verifier),
      rawKey,
      decodeBase64(response.Nonce)
    );
    if (decryptedNonce !== response.Nonce) {
      throw new Error('KeePassXC association failed. Nonce mismatch.');
    }

    return {
      key,
      id: response.Id,
      hash: response.Hash
    };
  }

  async isAssociated(dbHash: string): Promise<boolean> {
    const assoc = this.getAssociation(dbHash);
    if (!assoc) {
      return false;
    }
    const { id, key } = assoc;
    const nonce = getRandomNonce(KEY_SIZE);
    const nonceBase64 = encodeBase64(nonce);
    const request = {
      RequestType: actions.TEST_ASSOCIATE,
      TriggerUnlock: false,
      Id: id,
      Nonce: nonceBase64,
      Verifier: encrypt(convertStringToByteArray(nonceBase64), key, nonce)
    };

    const response = await postRequest(this.getUrl(), request);
    if (!response.Success) {
      return false;
    }
    const decryptedNonce = decrypt(
      decodeBase64(response.Verifier),
      key,
      decodeBase64(response.Nonce)
    );
    if (!(decryptedNonce === response.Nonce && response.Id === id)) {
      return false;
    }

    return true;
  }
}
