import * as nacl from 'tweetnacl';
import browser from './browser';

const KEY_SIZE = 24;
const NATIVE_HOST_NAME = 'com.varjolintu.keepassxc_browser';

let nativePort = null;
let serverPublicKey = null;
// let isConnected = false;
// let publicKey = null;
// let secretKey = null;
// let serverPublicKey = null;

function encodeBase64(d) {
  return nacl.util.encodeBase64(d);
}

function decodeBase64(d) {
  return nacl.util.decodeBase64(d);
}

function getNewKeyPair() {
  const { publicKey, secretKey } = nacl.box.keyPair();
  return { publicKey, secretKey };
}

// connect to native host and exchange public keys
export function getNativePort() {
  return new Promise((resolve, reject) => {
    if (nativePort) {
      return resolve(nativePort);
    }

    console.log(`Connecting to native messaging host ${NATIVE_HOST_NAME}`);
    nativePort = browser.runtime.connectNative(NATIVE_HOST_NAME);
    nativePort.onMessage.addListener(msg => {
      switch (msg.action) {
        case 'change-public-keys': {
          const {
            version,
            publicKey: publicKeyBase64,
            success,
            nonce: nonceBase64
          } = msg;
          if (!success || !publicKeyBase64) {
            reject(Error('Key exchange failed'));
            return false;
          }

          // const nonce = decodeBase64(nonceBase64);
          serverPublicKey = decodeBase64(publicKeyBase64);

          resolve(nativePort);
          return true;
        }
        default:
          return false;
      }
    });
    nativePort.onDisconnect.addListener(() => {
      nativePort = null;
    });

    const { publicKey, secretKey } = getNewKeyPair();
    const key = encodeBase64(publicKey);
    let nonce = nacl.randomBytes(KEY_SIZE);
    nonce = encodeBase64(nonce);

    nativePort.postMessage({
      action: 'change-public-keys',
      publicKey: key,
      nonce
    });
  });
}

export function getDatabaseHash() {
  return getNativePort()
  .then(port => {
    const listener = port.onMessage.addListener(msg => {
      if (msg.action === 'get-databasehash') {
        port.onMessage.removeListener(listener);
        const { errorCode, hash } = msg;
        if (errorCode) {
          throw Error(`Error getting database hash. Code ${errorCode}`);
        }
        return hash;
      }
    });
    port.postMessage({ action: 'get-databasehash' });
  });
}
