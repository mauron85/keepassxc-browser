import * as nacl from 'tweetnacl';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8
} from 'tweetnacl-util';

const DEFAULT_KEY_SIZE = 24;

export function isNonceValid(nonce) {
  return nonce.length === nacl.secretbox.nonceLength;
}

export function encrypt(message, nonce, serverPublicKey, secretKey) {
  const messageData = decodeUTF8(JSON.stringify(message));
  const messageBox = nacl.box(messageData, nonce, serverPublicKey, secretKey);
  if (!messageBox) {
    return '';
  }
  return encodeBase64(messageBox);
}

export function decrypt(message, nonce, serverPublicKey, secretKey) {
  const m = decodeBase64(message);
  const n = decodeBase64(nonce);
  return nacl.box.open(m, n, serverPublicKey, secretKey);
}

export function getNewKeyPair() {
  const { publicKey, secretKey } = nacl.box.keyPair();
  return { publicKey, secretKey };
}

export function getRandomNonce(keySize = DEFAULT_KEY_SIZE) {
  return nacl.randomBytes(keySize);
}
