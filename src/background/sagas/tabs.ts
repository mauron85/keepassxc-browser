import { take, put, call, apply, fork } from 'redux-saga/effects';
import createChannel, { actions } from './channels/tabs';
import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

export default function* tabsSaga() {
  const channel = yield call(createChannel);

  try {
    // take(END) will cause the saga to terminate by jumping to the finally block
    while (true) {
      const action = yield take(channel);
      switch (action.type) {
        case actions.TAB_ACTIVATED:
          yield put({ type: T.TAB_ACTIVATED, payload: action.payload });
          break;
        default:
          break;
      }
    }
  } finally {
    console.log('tabsSaga terminated');
  }
}
