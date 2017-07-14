import { eventChannel, END } from 'redux-saga';
import getBrowser from '../../../common/browser';

export default function createChannel() {
  return eventChannel(emit => {
    const listener = command => {
      emit(command);
      return true;
    };

    const browser = getBrowser();
    browser.commands.onCommand.addListener(listener);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      browser.commands.onCommand.removeListener(listener);
    };

    return unsubscribe;
  });
}
