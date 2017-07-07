/* globals window, document */
import { h, app } from 'hyperapp';
import Popup from './Popup';
import InitialState from './InitialState';
import NotAvailable from './NotAvailable';
import DbClosed from './DbClosed';
import NotConfigured from './NotConfigured';
import NeedReconfigure from './NeedReconfigure';
import NotAssociated from './NotAssociated';
import Associated from './Associated';
import ShowError from './ShowError';
import InvalidState from './InitialState';
import { sendMessageWithTimeout, TimeoutError } from './messaging';

function convert(str) {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#039;');
  return str;
}

const state = {
  UNKNOWN: -2,
  ERROR: -1,
  INITIAL: 0,
  NOT_AVAILABLE: 1,
  DB_CLOSED: 2,
  NOT_CONFIGURED: 3,
  UNRECOGNIZED_ENCRYPTION_KEY: 4,
  NOT_ASSOCIATED: 5,
  ASSOCIATED: 6
};

const responseToState = props => {
  const {
    keePassXCAvailable = false,
    databaseClosed,
    configured,
    encryptionKeyUnrecognized,
    associated,
    identifier,
    error
  } = props;
  if (!keePassXCAvailable) {
    return state.NOT_AVAILABLE;
  }
  if (databaseClosed) {
    return state.DB_CLOSED;
  }
  if (!configured) {
    return state.NOT_CONFIGURED;
  }
  if (encryptionKeyUnrecognized) {
    return state.UNRECOGNIZED_ENCRYPTION_KEY;
  }
  if (!associated) {
    return state.NOT_ASSOCIATED;
  }
  if (error) {
    return state.ERROR;
  }
  if (identifier) {
    return state.ASSOCIATED;
  }
  return state.UNKNOWN;
};

let getStatus;
if (window.chrome && chrome.runtime && chrome.runtime.id) {
  // Code running in a Chrome extension (content script, background page, etc.)
  getStatus = timeoutInMillis =>
    sendMessageWithTimeout({ action: 'get_status' }, timeoutInMillis);
} else {
  // this is just for development in normal browser window
  getStatus = timeoutInMillis => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Response time out after ${timeoutInMillis} ms`));
        // resolve({
        //   keePassXCAvailable: true,
        //   databaseClosed: false,
        //   configured: true,
        //   encryptionKeyUnrecognized: true,
        //   associated: true,
        //   error: 'aaa'
        // });
      }, timeoutInMillis);
    });
  };
}

export default function render() {
  const defaultState = {
    appState: state.INITIAL,
    indentifier: '',
    error: null
  };

  app({
    state: Object.assign({ isNewerVersion: false }, defaultState),
    view: ({ appState, error, trace, identifier, isNewerVersion }, actions) => {
      switch (appState) {
        case state.ERROR:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <ShowError
                trace={convert(trace)}
                error={error}
                onReconnect={actions.reconnect}
              />
            </Popup>
          );
        case state.INITIAL:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <InitialState />
            </Popup>
          );
        case state.NOT_AVAILABLE:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <NotAvailable onReconnect={actions.reconnect} />
            </Popup>
          );
        case state.DB_CLOSED:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <DbClosed onReconnect={actions.reconnect} />
            </Popup>
          );
        case state.NOT_CONFIGURED:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <NotConfigured onConfigure={actions.configure} />
            </Popup>
          );
        case state.UNRECOGNIZED_ENCRYPTION_KEY:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <NeedReconfigure
                message={error}
                onConfigure={actions.configure}
              />
            </Popup>
          );
        case state.NOT_ASSOCIATED:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <NotAssociated onConfigure={actions.reconnect} />
            </Popup>
          );
        case state.ASSOCIATED:
          return (
            <Popup showUpdateNotice={isNewerVersion}>
              <Associated identifier={identifier} />
            </Popup>
          );
        default:
          return (
            <Popup>
              <InvalidState />
            </Popup>
          );
      }
    },
    actions: {
      // using underscore for params not interested in
      // this is mostly 'state' we are replacing with new
      setState: (currentState, __, newState) => {
        return Object.assign({}, currentState, newState);
      },
      configure: async (_, actions) => {
        actions.setState(defaultState);
        try {
          const response = await sendMessageWithTimeout(
            { action: 'associate' },
            5000
          );
          const appState = responseToState(response);
          const { error, identifier } = response;
          actions.setState({ appState, error, identifier });
        } catch (error) {
          if (error instanceof TimeoutError) {
            actions.setState({
              appState: state.NOT_AVAILABLE,
              error: error.message
            });
          } else {
            actions.setState({
              appState: state.ERROR,
              error: error.message,
              trace: error.stack
            });
          }
        }
      },
      reconnect: async (_, actions) => {
        actions.setState(defaultState);
        try {
          const response = await sendMessageWithTimeout(
            { action: 'reconnect' },
            5000
          );
          const appState = responseToState(response);
          const { error, identifier } = response;
          actions.setState({ appState, error, identifier });
        } catch (error) {
          if (error instanceof TimeoutError) {
            actions.setState({
              appState: state.NOT_AVAILABLE,
              error: error.message
            });
          } else {
            actions.setState({
              appState: state.ERROR,
              error: error.message,
              trace: error.stack
            });
          }
        }
      }
    },
    events: {
      loaded: async (_, actions) => {
        try {
          const isNewerVersion = await sendMessageWithTimeout(
            { action: 'update_available_keepassxc' },
            15000
          );
          const response = await getStatus(5000);
          const appState = responseToState(response);
          const { error, identifier } = response;
          actions.setState({
            appState,
            identifier,
            error,
            isNewerVersion
          });
        } catch (error) {
          if (error instanceof TimeoutError) {
            actions.setState({
              appState: state.NOT_AVAILABLE,
              error: error.message
            });
          } else {
            actions.setState({
              appState: state.ERROR,
              error: error.message,
              trace: error.stack
            });
          }
        }
      }
    },
    root: document.getElementById('popup')
  });
}
