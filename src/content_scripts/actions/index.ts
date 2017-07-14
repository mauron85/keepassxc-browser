import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

export function getSettings(): Promise<any> {
  return new Promise((resolve) => {
    getBrowser().runtime.sendMessage({ type: T.GET_SETTINGS }, (settings) => {
      resolve(settings);
    });
  });
}
