import { eventChannel, END } from 'redux-saga';

export default function createChannel(port) {
  return eventChannel(emit => {
    const listener = msg => {
      emit(msg);
      return true;
    };

    port.onMessage.addListener(listener);
    port.onDisconnect.addListener(() => {
      emit(END);
    });

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      port.onMessage.removeListener(listener);
    };

    return unsubscribe;
  });
}
