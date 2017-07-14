import { take, put, call, apply } from 'redux-saga/effects';
import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

const ICON_BASE_PATH = '/icons/19x19/';
const DB_NOT_AVAILABLE = 'icon_bang_19x19.png';

const browser = getBrowser();

function* setIcon(icon) {
  browser.browserAction.setIcon({
    path: `${ICON_BASE_PATH}/${icon}`
  });  
}

export default function* popupSaga() {
  try {    
    while (true) {
      yield take(T.GET_DATABASE_HASH_FAILURE);
      yield call(setIcon, DB_NOT_AVAILABLE);
    }
  } finally {
    console.log('popupSaga terminated');
  }
}