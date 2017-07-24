import getBrowser from '../../common/browser';
import * as T from '../../common/actionTypes';

const browser = getBrowser();

export function getSettings(): Promise<any> {
  return new Promise(resolve => {
    browser.runtime.sendMessage({ type: T.GET_SETTINGS }, settings => {
      resolve(settings);
    });
  });
}
