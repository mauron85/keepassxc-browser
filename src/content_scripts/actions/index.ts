import browser from '../../common/browser';
import * as T from '../../common/actionTypes';

export function getOptions() {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ action: T.GET_OPTIONS }, (options) => {
      resolve(options);
    });
  });
}

export function retrieveCredentials({ url, submitUrl }) {
  return new Promise(resolve => {
    browser.runtime.sendMessage(
      {
        action: 'retrieve_credentials',
        args: [url, submitUrl]
      },
      (credentials, dontAutoFillIn) => {
        resolve([credentials, dontAutoFillIn]);
      }
    );
  });
}
