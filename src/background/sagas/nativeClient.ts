import { take, put, call, apply, select, race } from 'redux-saga/effects';
import { delay } from 'redux-saga'
import getBrowser from '../../common/browser';
import createChannel from './channels/message';

let port;

const NATIVE_HOST_NAME = 'com.varjolintu.keepassxc_browser';

export function* postMessage(message) {
  port.postMessage(message);

  const { response, timeout } = yield race({
    response: take(message.action),
    timeout: call(delay, 3000)
  });

  if (timeout) {
    throw new Error('Response timeout');
  }

  return response.payload;
}

export default function* nativeClientSaga() {
  port = getBrowser().runtime.connectNative(NATIVE_HOST_NAME);
  const channel = yield call(createChannel, port);
  try {
    while (true) {
      const msg = yield take(channel);
      yield put({ type: msg.action, payload: msg });
      // take(END) will cause the saga to terminate by jumping to the finally block
    }
  } finally {
    console.log('nativeClientSaga terminated');
  }
}
