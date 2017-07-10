import { SagaIterator } from 'redux-saga';
import { put, all, takeEvery, call, select } from 'redux-saga/effects';
import browserSaga from './browser';
import popupSaga from './popup';
import nativeClientSaga from './nativeClient';
import * as T from '../../common/actionTypes';

export default function* rootSaga() {
  yield all([call(browserSaga), call(popupSaga), call(nativeClientSaga)]);
}
