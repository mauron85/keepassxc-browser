import { all, call } from 'redux-saga/effects';
import browserSaga from './browser';
import popupSaga from './popup';
import commandSaga from './command';
import contextMenuSaga from './contextMenu';
import nativeClientSaga from './nativeClient';

export default function* rootSaga() {
  yield all([
    call(browserSaga),
    call(commandSaga),
    call(popupSaga),
    call(contextMenuSaga),
    call(nativeClientSaga)
  ]);
}
