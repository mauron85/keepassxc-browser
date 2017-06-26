/* globals window, document */
import { h, app } from 'hyperapp';

const browser = window.msBrowser || window.browser || window.chrome;

function convert(str) {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#039;');
  return str;
}

/* When transpiling with babel
 * we cannot use instance of
 * and we're using it. Beware!
 */
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
    this.message = message;
  }
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

const sendMessage = message => {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage(message, (response = {}) => {
      resolve(response);
    });
  });
};

const sendMessageWithTimeout = (message, timeoutInMillis = 5000) => {
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

const redetectCredentialFields = () => sendMessage('redetect_fields');
const specifyCredentialsFields = () => {
  browser.runtime.getBackgroundPage(global => {
    // TODO:
    browser.tabs.sendMessage(global.page.currentTabId, {
      action: 'choose_credential_fields'
    });
    close();
  });
};
const openOptionsPage = () => {
  browser.runtime.openOptionsPage();
  close();
};

const Popup = (props, children) => {
  const { showUpdateNotice = false } = props || {};
  return (
    <div class="popup">
      <div id="settings" class="settings">
        <button
          id="btn-choose-credential-fields"
          class="btn btn-sm btn-b"
          onclick={specifyCredentialsFields}
        >
          Set credential fields for this page
        </button>
        {showUpdateNotice &&
          <div class="update-available">
            You use an old version of KeePassXC.
            <br />
            <a target="_blank" href="https://keepassxc.org/download">
              Please download the latest version from keepassxc.org
            </a>.
          </div>}
      </div>
      {children}
      <div class="popup__footer">
        <a href="#" class="link" onclick={openOptionsPage}>
          Extension options
        </a>
      </div>
    </div>
  );
};

const InitialState = () =>
  <div class="popup__content">
    <div class="popup__status-check">
      <img
        width="20"
        height="20"
        class="popup__status-check-spinner"
        src="spinner.gif"
      />
      <span>Checking status...</span>
    </div>
  </div>;

const NotAvailable = props => {
  return (
    <div class="popup__content">
      <div class="popup__message">
        Cannot connect to KeePassXC. Check if app is running.
      </div>
      <div class="popup__actions">
        <button
          id="reload-status-button"
          class="btn btn-sm btn-a"
          onclick={props.onReconnect}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

const DbClosed = props => {
  return (
    <div class="popup__content">
      <div class="popup__message">
        KeePassXC database seems to be closed. Please open.
      </div>
      <div class="popup__actions">
        <button
          id="reload-status-button"
          class="btn btn-sm btn-a"
          onclick={props.onReconnect}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

const NotConfigured = props =>
  <div class="popup__content">
    <div class="popup__message">
      keepassxc-browser has not been configured. Press the connect button to
      register and pair with KeePassXC.
    </div>
    <div class="popup__actions">
      <button
        id="connect-button"
        class="btn btn-sm btn-a"
        onclick={props.onConfigure}
      >
        Connect
      </button>
    </div>
  </div>;

const NeedReconfigure = props =>
  <div class="popup__content">
    <div class="popup__message">
      keepassxc-browser has been disconnected from KeePassXC.
      <div class="error">
        <code class="error__message">{props.message}</code>
      </div>
      <div>
        Press the reconnect button to establish a new connection.
      </div>
    </div>
    <div class="popup__actions">
      <button
        id="reconnect-button"
        class="btn btn-sm btn-a"
        onclick={props.onConfigure}
      >
        Reconnect
      </button>
    </div>
  </div>;

const NotAssociated = props => {
  const { identifier } = props || {};
  return (
    <div class="popup__content">
      <div class="popup__message">
        keepassxc-browser has been configured using the identifier
        <em>{identifier}</em> and has not yet connected to
        KeePassXC.
      </div>
      <div class="popup__actions">
        <button
          id="reconnect-button"
          class="btn btn-sm btn-a"
          onclick={props.onConfigure}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

const Associated = props => {
  const { identifier } = props || {};
  return (
    <div class="popup__content">
      <div class="popup__message">
        keepassxc-browser has been configured using the identifier "
        <em>{identifier}</em>" and is successfully connected to
        KeePassXC.
      </div>
      <div class="popup__actions">
        <button
          id="redetect-fields-button"
          class="btn btn-sm"
          onclick={redetectCredentialFields}
        >
          Redetect credential fields
        </button>
      </div>
    </div>
  );
};

const ShowError = ({ trace, error, onReconnect }) =>
  <div class="popup__content">
    <div class="popup__message popup__message--error">
      keepassxc-browser has encountered an error:
      <div class="error">
        <code class="error__message">{error}</code>
      </div>
      {trace &&
        <div class="error">
          <code class="error__message">{trace}</code>
        </div>}
    </div>
    <div class="popup__actions">
      <button
        id="reload-status-button"
        class="btn btn-sm btn-a"
        onclick={onReconnect}
      >
        Reload
      </button>
    </div>
  </div>;

const InvalidState = () =>
  <div class="popup__content">
    <div class="popup__message">
      Invalid State. Oops this is our fault. Please report.
    </div>
  </div>;

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
          const response = await getStatus(5000);
          const isNewerVersion = await sendMessageWithTimeout(
            { action: 'update_available_keepassxc' },
            15000
          );
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
