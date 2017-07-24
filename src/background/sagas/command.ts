import { take, put, call, apply, fork } from 'redux-saga/effects';
import createChannel from './channels/commands';
import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

const browser = getBrowser();

function* handleFillUsername() {
  browser.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length) {
      browser.tabs.sendMessage(tabs[0].id, {
        type: T.FILL_USERNAME
      });
    }
  });
}

function* handleFillPassword() {
  browser.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length) {
      browser.tabs.sendMessage(tabs[0].id, { type: T.FILL_PASSWORD });
    }
  });
}

export default function* commandSaga() {
  const channel = yield call(createChannel);

  try {
    // take(END) will cause the saga to terminate by jumping to the finally block
    while (true) {
      const command = yield take(channel);
      switch (command) {
        case T.FILL_USERNAME:
          yield call(handleFillUsername);
          break;
        case T.FILL_PASSWORD:
          yield call(handleFillPassword);
          break;
        default:
          break;
      }
    }
  } finally {
    console.log('commandSaga terminated');
  }
}
