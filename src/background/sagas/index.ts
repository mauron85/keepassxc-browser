import { all, call } from 'redux-saga/effects';
import browserSaga from './browser';
import popupSaga from './popup';
import commandSaga from './command';
import contextMenuSaga from './contextMenu';
import nativeClientSaga from './nativeClient';
import tabsSaga from './tabs';

export default function* rootSaga() {
  yield all([
    call(tabsSaga),
    call(browserSaga),
    call(commandSaga),
    call(popupSaga),
    call(contextMenuSaga),
    call(nativeClientSaga)
  ]);
}
