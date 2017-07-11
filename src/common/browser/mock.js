import * as T from '../actionTypes';

const listeners = [];

const addListener = (listener) => { listeners.push(listener); };

export default function getBrowser() {
  return {
    runtime: {
      connect: () => ({
        onMessage: { addListener },
        postMessage: (msg) => {
          switch (msg.type) {
            case T.TEST_CONNECT:
              setTimeout(() => {
                listeners.forEach((listener) => {
                  listener({ type: T.TEST_CONNECT_SUCCESS });
                });
              }, 1000);
              return true;
            default:
              return false;
          }
        }
      })
    }
  };
}
