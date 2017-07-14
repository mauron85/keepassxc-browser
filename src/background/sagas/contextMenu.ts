import { take, put, call, apply, fork } from 'redux-saga/effects';
import createChannel from './channels/contextMenu';
import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

const browser = getBrowser();

function* handleFillUsername(action) {
  const { tab, info } = action.payload;
  browser.tabs.sendMessage(tab.id, { type: action.type });
}

function* handleFillPassword(action) {
  const { tab, info } = action.payload;
  browser.tabs.sendMessage(tab.id, { type: action.type });
}

export default function* browserSaga() {
  const channel = yield call(createChannel);

  try {
    // take(END) will cause the saga to terminate by jumping to the finally block
    while (true) {
      const action = yield take(channel);
      switch (action.type) {
        case T.FILL_USERNAME:
          yield call(handleFillUsername, action);
          break;
        case T.FILL_PASSWORD:
          yield call(handleFillPassword, action);
          break;
        default:
          break;
      }
    }
  } finally {
    console.log('contextMenuSaga terminated');
  }
}
