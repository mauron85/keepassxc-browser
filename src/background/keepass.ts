import * as nacl from 'tweetnacl';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8
} from 'tweetnacl-util';
import { take, put, call, apply } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import browser from '../common/browser';
import * as store from '../common/store';

const KEY_SIZE = 24;

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

export function getRandomNonce() {
  return nacl.randomBytes(KEY_SIZE);
}

// export function getCredentials({ origin, formUrl }) {
//   return getNativePort().then(port => {
//     const key = encodeBase64(publicKey);
//     const nonce = nacl.randomBytes(KEY_SIZE);
//     const dbId = ''; // getDatabaseHash().id;

//     return new Promise((resolve, reject) => {
//       const listener = port.onMessage.addListener(msg => {
//         if (msg.action === actions.GET_LOGINS) {
//           port.onMessage.removeListener(listener);
//           const { message, nonce } = msg;
//           const payloadString = decrypt(message, nonce);
//           if (!payloadString) {
//             return reject(
//               new Error('Cannot decrypt message from native client')
//             );
//           }
//           const payload = JSON.parse(encodeUTF8(payloadString));
//           if (payload.success !== 'true') {
//             return reject(
//               new Error('Retrieving credentials was not succesful')
//             );
//           }
//           if (!isNonceValid(nonce)) {
//             return reject(new Error('Not valid payload from native client'));
//           }

//           return resolve(payload.entries);
//         }
//       });

//       const message = {
//         id: dbId,
//         url: origin,
//         submiturl: formUrl
//       };

//       port.postMessage({
//         action: actions.GET_LOGINS,
//         message: encrypt(message, nonce),
//         nonce: encodeBase64(nonce)
//       });
//     });
//   });
// }

export function testAssociation() {}
