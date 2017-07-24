import { take, takeEvery, put, call, apply } from 'redux-saga/effects';
import getBrowser from '../../common/browser';
import { getDatabaseHash, isAssociated } from './tab';
import * as T from '../../common/actionTypes';

const ICON_BASE_PATH = '/icons/19x19/';
const DB_ASSOCIATED_ICON = 'icon_normal_19x19.png';
const DB_NOT_AVAILABLE_ICON = 'icon_cross_19x19.png';
const DB_NOT_ASSOCIATED_ICON = 'icon_bang_19x19.png';

const browser = getBrowser();

function* setIcon(icon) {
  browser.browserAction.setIcon({
    path: `${ICON_BASE_PATH}/${icon}`
  });  
}

function* handleTabActivated(action) {
  console.log('[DEBUG] tab activated', action.payload);
  try {
    const hash = yield call(getDatabaseHash);
    const isDbAssociated = yield call(isAssociated, hash);
    yield call(setIcon, isDbAssociated ? DB_ASSOCIATED_ICON : DB_NOT_ASSOCIATED_ICON);
  } catch(error) {
    yield call(setIcon, DB_NOT_AVAILABLE_ICON);
  }
}

function* handleAssociated() {
  yield call(setIcon, DB_ASSOCIATED_ICON);
}

export default function* popupSaga() {
  yield takeEvery(T.TAB_ACTIVATED, handleTabActivated);
  yield takeEvery(T.ASSOCIATE_SUCCESS, handleAssociated);
  // try {    
  //   while (true) {
  //     yield take(T.GET_DATABASE_HASH_FAILURE);
  //     yield call(setIcon, DB_NOT_AVAILABLE);
  //   }
  // } finally {
  //   console.log('popupSaga terminated');
  // }
}