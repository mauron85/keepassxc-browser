/* globals window, document */
import { h, app } from 'hyperapp';
import CredentialsMenu from './CredentialsMenu';
import { getFormFields } from './forms';
import getBrowser from '../common/browser';
import * as T from '../common/actionTypes';
import { getSettings } from './actions';

const browser = getBrowser();

const states = {
  UNKNOWN: -2,
  ERROR: -1,
  INITIAL: 0,
  // WAITING_FOR_CREDENTIALS: 5,
  // SHOWING_USERNAMES: 6,
  SHOW_USERNAMES: 1,
  FILL_USERNAME: 2,
  FILL_PASSWORD: 3,
  FILLED_USERNAME: 4
};

function getMenuPositionRelativeToElement(el) {
  const { scrollX, scrollY } = window;
  const { top, right, bottom, left, width } = el.getBoundingClientRect();

  return {
    top: bottom + scrollY,
    left: 2 + left + scrollX, // add 2px offset to look better
    width
  };
}

let run = () => {
  let port;
  let inputElement: HTMLInputElement;

  const defaultState = {
    currentState: states.INITIAL,
    nextState: states.INITIAL,
    credentials: [],
    credentialSelected: -1
  };
  const el = document.body.appendChild(document.createElement('div'));
  el.className = 'keepassxc';

  app({
    state: defaultState,
    view: (state, actions) => {
      const { currentState, credentials, credentialSelected } = state;
      switch (currentState) {
        case states.FILL_USERNAME:
        case states.FILL_PASSWORD:
        case states.SHOW_USERNAMES:
          const menuPosition = getMenuPositionRelativeToElement(inputElement);
          return (
            <CredentialsMenu
              {...menuPosition}
              credentials={credentials}
              selected={credentialSelected}
              onHover={actions.handleMenuItemHover}
              onSelect={actions.handleCredentialSelect}
            />
          );
        default:
          return <div />;
      }
    },
    actions: {
      setState: (currentState, actions, newState) => {
        return Object.assign({}, currentState, newState);
      },
      handleDocumentClick: (state, actions, event) => {
        const el = event.target as HTMLInputElement;

        if (state.currentState !== states.INITIAL && !/keepassxc/.test(el.className)) {
          inputElement = null;
          return defaultState;
        }

        // only process text and email inputs
        if (['text', 'email'].indexOf(el.type) < 0) {
          return state;
        }

        return actions.showUsernames(el);
      },
      handleKeyPress: (state, actions, event) => {
        const key = event.key;
        const { currentState, credentials } = state;
        if (currentState === states.INITIAL) {
          return state;
        }

        let { credentialSelected } = state;
        switch (key) {
          case 'Enter':
            event.preventDefault();
            return actions.handleCredentialSelect(credentialSelected);
          case 'Escape':
            return defaultState;
          case 'Tab':
            return Object.assign({}, state, { currentState: states.FILLED_USERNAME })
          case 'ArrowUp':
            credentialSelected = --credentialSelected < 0 ? credentials.length - 1 : credentialSelected;
            return Object.assign({}, state, { credentialSelected })
          case 'ArrowDown':
            credentialSelected = ++credentialSelected > credentials.length - 1 ? 0 : credentialSelected;
            return Object.assign({}, state, { credentialSelected })
          default:
            return state;
        }
      },
      fillUsername: (state, actions) => {
        const el = document.activeElement as HTMLInputElement;
        const origin = document.location.origin;
        const form = el.closest('form') as HTMLFormElement;
        const formAction = form && form.action;

        inputElement = el;

        port.postMessage({
          type: T.GET_CREDENTIALS,
          payload: { origin, formAction }
        });

        return Object.assign({}, state, { nextState: states.FILL_USERNAME });
      },
      fillPassword: (state, actions) => {
        const el = document.activeElement as HTMLInputElement;
        const { currentState, credentials, credentialSelected } = state;

        if (
          currentState === states.FILLED_USERNAME &&
          credentialSelected > -1
        ) {
          const { password } = credentials[credentialSelected];
          el.value = password;
          return defaultState;
        }

        const origin = document.location.origin;
        const form = el.closest('form') as HTMLFormElement;
        const formAction = form && form.action;

        inputElement = el;

        port.postMessage({
          type: T.GET_CREDENTIALS,
          payload: { origin, formAction }
        });

        return Object.assign({}, state, { nextState: states.FILL_PASSWORD });
      },
      showUsernames: (state, actions, el) => {
        const origin = document.location.origin;
        const form = el.closest('form') as HTMLFormElement;
        const formAction = form && form.action;

        inputElement = el;

        port.postMessage({
          type: T.GET_CREDENTIALS,
          payload: { origin, formAction }
        });

        return Object.assign({}, state, { nextState: states.SHOW_USERNAMES });
      },
      handleMessage: (state, actions, msg) => {
        switch (msg.type) {
          case T.GET_CREDENTIALS_SUCCESS: {
            const credentials = msg.payload;
            if (!(Array.isArray(credentials) && credentials.length > 0)) {
              return defaultState;
            }

            if (credentials.length === 1) {
              const { nextState } = state;
              if (nextState === states.FILL_USERNAME) {
                inputElement.value = credentials[0].login;
                return Object.assign({}, state, {
                  currentState: states.FILLED_USERNAME,
                  credentialSelected: 0,
                  credentials
                });     
              }
              if (nextState === states.FILL_PASSWORD) {
                inputElement.value = credentials[0].password;
                return defaultState;
              }
            }

            return Object.assign({}, state, {
              currentState: state.nextState,
              credentials
            });
          }
          case T.GET_CREDENTIALS_FAILURE:
            console.log(msg.payload);
            return defaultState;
          default:
            return state;
        }
      },
      handleMenuItemHover: (state, actions, credentialIndex) => {
        return Object.assign({}, state, { credentialSelected: credentialIndex });
      },
      handleCredentialSelect: (state, actions, credentialIndex) => {
        const { currentState, credentials } = state;
        const { login, password } = credentials[credentialIndex];

        if (currentState === states.FILL_USERNAME) {
          inputElement.value = login;
          inputElement.focus();
          return Object.assign({}, state, {
            currentState: states.FILLED_USERNAME,
            credentialSelected: credentialIndex
          });
        }

        if (currentState === states.FILL_PASSWORD) {
          inputElement.value = password;
          inputElement.focus();
          return defaultState;
        }

        if (currentState === states.SHOW_USERNAMES) {
          inputElement.value = login;
          const form = inputElement.closest('form');
          if (form) {
            const passwordElement = form.querySelector(
              'input[type="password"]'
            ) as HTMLInputElement;
            if (passwordElement) {
              passwordElement.value = password;
            }
          }
        }

        return defaultState;
      }
    },
    events: {
      loaded: async (state, actions) => {
        // const { autoRetrieveCredentials } = await getSettings();

        browser.runtime.onMessage.addListener(msg => {
          switch (msg.type) {
            case T.FILL_USERNAME: {
              actions.fillUsername();
              return true;
            }
            case T.FILL_PASSWORD: {
              actions.fillPassword();
              return true;
            }
            default:
              return false;
          }
        });

        port = browser.runtime.connect({ name: 'content_script' });
        port.onMessage.addListener(msg => {
          actions.handleMessage(msg);
        });

        // attach single global event listener
        document.addEventListener('click', event => {
          actions.handleDocumentClick(event);
        });

        document.addEventListener('keydown', event => {
          actions.handleKeyPress(event);
        });

        const [usernameEl, passwordEl] = getFormFields(10);
        if (passwordEl) {
          passwordEl.className += ' keepassxc-password-field';
        }
      }
    },
    root: el
  });
};

document.onreadystatechange = event => {
  if (document.readyState !== 'complete') {
    return;
  }

  run();
};
