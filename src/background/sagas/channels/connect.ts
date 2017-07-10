import { eventChannel, END } from 'redux-saga';
import getBrowser from '../../../common/browser';

export const ON_CONNECT = 'ON_CONNECT';

export default function createChannel() {
  return eventChannel(emit => {
    const listener = port => {
      emit({ type: ON_CONNECT, port });
    };

    const browser = getBrowser();
    browser.runtime.onConnect.addListener(listener);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      browser.runtime.onConnect.removeListener(listener);
    };

    return unsubscribe;
  });
}
