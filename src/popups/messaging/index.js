/* globals window */

const browser = window.msBrowser || window.browser || window.chrome;

/* When transpiling with babel
 * we cannot use instance of
 * and we're using it. Beware!
 */
export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
    this.message = message;
  }
}

export const sendMessage = message => {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage(message, (response = {}) => {
      resolve(response);
    });
  });
};

export const sendMessageWithTimeout = (message, timeoutInMillis = 5000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () =>
        reject(
          new TimeoutError(`Response time out after ${timeoutInMillis} ms`)
        ),
      timeoutInMillis
    );
    browser.runtime.sendMessage(message, (response = {}) => {
      clearTimeout(timeoutId);
      resolve(response);
    });
  });
};
