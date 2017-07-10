import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

export function getSettings() {
  return new Promise((resolve) => {
    getBrowser().runtime.sendMessage({ action: T.GET_SETTINGS }, (settings) => {
      resolve(settings);
    });
  });
}
