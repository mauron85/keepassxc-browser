import { eventChannel, END } from 'redux-saga';
import getBrowser from '../../../common/browser';

export default function createChannel() {
  return eventChannel(emit => {
    const listener = (info, tab) => {
      const { menuItemId } = info;
      emit({ type: menuItemId, payload: { info, tab } });
      return true;
    };

    const browser = getBrowser();
    browser.contextMenus.onClicked.addListener(listener);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      browser.contextMenus.onClicked.removeListener(listener);
    };

    return unsubscribe;
  });
}
