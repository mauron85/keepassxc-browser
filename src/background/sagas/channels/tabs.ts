import { eventChannel, END } from 'redux-saga';
import getBrowser from '../../../common/browser';

export const actions = {
  TAB_ACTIVATED: 'TAB_ACTIVATED'
};

export default function createChannel() {
  return eventChannel(emit => {
    const listener = activeInfo => {
      emit({ type: actions.TAB_ACTIVATED, payload: activeInfo });
      return true;
    };

    const browser = getBrowser();
    browser.tabs.onActivated.addListener(listener);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      browser.tabs.onActivated.removeListener(listener);
    };

    return unsubscribe;
  });
}
