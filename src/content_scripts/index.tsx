/* globals window, document */
import { h, app } from 'hyperapp';
import CredentialsMenu from './CredentialsMenu';
import { getFormFields } from './forms';
import browser from '../common/browser';
import * as T from '../common/actionTypes';
import { getSettings } from './actions';

const state = {
  UNKNOWN: -2,
  ERROR: -1,
  INITIAL: 0,
  SHOW_CREDENTIALS_MENU: 1
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
  const defaultState = { appState: state.INITIAL, credentials: [], element: null };
  const el = document.body.appendChild(document.createElement('div'));
  el.className = 'keepassxc';

  app({
    state: defaultState,
    view: (state, actions) => {
      const { appState, inputElement, credentials } = state;
      switch (appState) {
        case state.SHOW_CREDENTIALS_MENU:
          const menuPosition = getMenuPositionRelativeToElement(inputElement);
          return (
            <CredentialsMenu
              {...menuPosition}
              credentials={credentials}
              onSelect={actions.onCredentialSelect}
            />
          );
        default:
          return <div />;
      }
    },
    actions: {
      setState: (currentState, __, newState) => {
        return Object.assign({}, currentState, newState);
      },
      onCredentialSelect: (state, actions, credentialIndex) => {
        const { inputElement, credentials } = state;
        const { login, password } = credentials[credentialIndex];
        inputElement.value = login;
        const form = inputElement.closest('form');
        if (form) {
          const passwordElement = form.querySelector('input[type="password"]');
          if (passwordElement) {
            passwordElement.value = password;
          }
        }

        actions.setState(defaultState);
      }
    },
    events: {
      loaded: async (state, actions) => {
        const settings = await getSettings();

        port = browser.runtime.connect({ name: 'content_script' });
        port.onMessage.addListener(msg => {
          switch (msg.action) {
            case T.GET_CREDENTIALS_SUCCESS:
              actions.setState({ credentials: msg.payload });
              return true;
            case T.GET_CREDENTIALS_FAILURE:
              console.log(msg.payload);
              // actions.setState({ credentials: msg.payload });
              return true
            default:
              return false;
          }
        });

        // attach single global event listener
        document.addEventListener('click', event => {
          // only process text and email inputs
          const el = event.target as HTMLInputElement;
          if (['text', 'email'].indexOf(el.type) < 0) {
            return false;
          }

          // TODO: add confidence check

          const origin = document.location.origin;
          const formAction = (el.closest('form') as HTMLFormElement).action;
          port.postMessage({
            type: T.GET_CREDENTIALS,
            payload: { origin, formAction }
          });

          // el.addEventListener(
          //   'blur',
          //   () => setTimeout(() => actions.setState(defaultState), 250),
          //   { once: true }
          // );

          actions.setState({
            appState: state.SHOW_CREDENTIALS_MENU,
            inputElement: el,
          });
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

  // TODO: test if KeePassXC app is running
  // TODO: If there are no logins for this site, bail out now.
  run();
};
