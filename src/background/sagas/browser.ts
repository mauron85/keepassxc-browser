import { take, put, call, apply, fork } from 'redux-saga/effects';
import createChannel, { ON_CONNECT } from './channels/connect';
import tabSaga from './tab';
import * as T from '../../common/actionTypes';

export default function* browserSaga() {
  const channel = yield call(createChannel);

  try {
    // take(END) will cause the saga to terminate by jumping to the finally block
    while (true) {
      const action = yield take(channel);
      switch (action.type) {
        case ON_CONNECT:
          // TODO: replace fork with call, because we don't want to allow parallel messaging from multiple tabs
          yield fork(tabSaga, action.port);
          break;
        default:
          break;
      }
    }
  } finally {
    console.log('browserSaga terminated');
  }
}
