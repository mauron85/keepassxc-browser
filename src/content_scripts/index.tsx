/* globals window, document */
import { h, app } from 'hyperapp';
import $ from './selectors';
import getBrowser from '../common/browser';
import { getSettings } from './actions';
import { getFormFields, isUsernameField } from './forms';
import CredentialsMenu from './CredentialsMenu';
import CredentialsModal from './CredentialsModal';
import CredentialsForms from './CredentialsForms';
import CredentialsFields from './CredentialsFields';
import Countdown from './Countdown';
import * as T from '../common/actionTypes';

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
  FILLED_USERNAME: 4,
  CHOOSE_CREDENTIALS_FIELDS: 5
};

function parents(node) {
  let nodes = [node];
  for (; node; node = node.parentNode) {
    nodes.unshift(node);
  }
  return nodes;
}

// Source: https://stackoverflow.com/a/5350888/3896616
function commonAncestor(node1, node2) {
  let parents1 = parents(node1);
  let parents2 = parents(node2);

  if (parents1[0] != parents2[0]) {
    return null;
  }

  for (let i = 0; i < parents1.length; i++) {
    if (parents1[i] != parents2[i]) return parents1[i - 1];
  }
}

function getElementPosition(el) {
  const { scrollX, scrollY } = window;
  const { top, bottom, left, width, height } = el.getBoundingClientRect();

  return {
    top: top + scrollY,
    bottom: bottom + scrollY,
    left: left + scrollX,
    width,
    height
  };
}

function getAllForms() {
  return Array.prototype.slice.call(document.forms);
}

function getAllInputFields() {
  const inputTypes = ['text', 'email', 'password'].map(
    t => `input[type="${t}"]`
  );
  return $(inputTypes.join(','));
  // const forms = getAllForms();
  // forms.reduce((fields, form) => {
  //   const inputs = $(inputTypes.join(','), form);
  //   if (inputs.length > 0) {
  //     fields = fields.concat(inputs);
  //   }
  //   return fields;
  // }, [] /* as fields*/);
}

function getCommonAncestorsOfAllInputs() {
  const ancestors = [];
  const inputs = getAllInputFields();
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < inputs.length; j++) {
      if (j !== i) {
        const ancestor = commonAncestor(inputs[i], inputs[j]);
        if (
          ancestor &&
          ancestor.tagName !== 'BODY' &&
          ancestors.indexOf(ancestor) === -1
        ) {
          ancestors.push(ancestor);
        }
      }
    }
  }
  console.log(ancestors);
  return ancestors;
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
  const rootId = `keepassxc_${Date.now()}`;
  const appRoot = document.body;

  app({
    state: defaultState,
    view: (state, actions) => {
      const { currentState, credentials, credentialSelected } = state;

      // we need workaround for top-level node
      // unable to detect removal or update of child nodes
      // We'll basically wrap returned Component with empty div
      // https://github.com/hyperapp/hyperapp/issues/306#issuecomment-316478282
      let component = null;

      switch (currentState) {
        case states.FILL_USERNAME:
        case states.FILL_PASSWORD:
        case states.SHOW_USERNAMES:
          component = (
            <CredentialsMenu
              {...getElementPosition(inputElement)}
              credentials={credentials}
              selected={credentialSelected}
              onHover={actions.handleMenuItemHover}
              onSelect={actions.handleCredentialSelect}
            />
          );
          break;
        case states.FILLED_USERNAME:
          component = (
            <Countdown
              key="countdown"
              {...getElementPosition(inputElement)}
              duration={30}
              onFinish={() => actions.setState(defaultState)}
            />
          );
          break;
        case states.CHOOSE_CREDENTIALS_FIELDS:
          const root = document.getElementById(rootId).appendChild(document.createElement('div'));
          root.className = 'keepassxc-choose-credentials-forms';
          component = (
            <div>
              <div className="keepassxc-overlay" />
              <CredentialsModal
                onSkip={actions.handleModalSkip}
                onDismiss={actions.handleModalDismiss}
              />
              <CredentialsForms root={root} forms={getAllForms()} />
              <CredentialsFields fields={getAllInputFields()} />
            </div>
          );
          break;
        default:
          component = null;
      }
      return (
        <div id={rootId} className="keepassxc-root">
          {component}
        </div>
      );
    },
    actions: {
      setState: (currentState, actions, newState) => {
        return Object.assign({}, currentState, newState);
      },
      handleDocumentClick: (state, actions, event) => {
        const el = event.target as HTMLInputElement;

        if (
          state.currentState !== states.INITIAL &&
          !/keepassxc/.test(el.className)
        ) {
          inputElement = null;
          return defaultState;
        }

        const [usernameEl, passwordEl] = getFormFields(10);
        if (passwordEl) {
          passwordEl.className += ' keepassxc-password-field';
        }

        // show user names if confident
        if (isUsernameField(el, 20)) {
          return actions.showUsernames(el);
        }

        return state;
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
            if (credentialSelected > -1) {
              return actions.handleCredentialSelect(credentialSelected);
            }
            return defaultState;
          case 'Escape':
            return defaultState;
          case 'Tab':
            return Object.assign({}, state, {
              currentState: states.FILLED_USERNAME
            });
          case 'ArrowUp':
            credentialSelected =
              --credentialSelected < 0
                ? credentials.length - 1
                : credentialSelected;
            return Object.assign({}, state, { credentialSelected });
          case 'ArrowDown':
            credentialSelected =
              ++credentialSelected > credentials.length - 1
                ? 0
                : credentialSelected;
            return Object.assign({}, state, { credentialSelected });
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
      chooseCredentialFields: (state, actions) => {
        return Object.assign({}, defaultState, {
          currentState: states.CHOOSE_CREDENTIALS_FIELDS
        });
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
        return Object.assign({}, state, {
          credentialSelected: credentialIndex
        });
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
      },
      handleModalSkip: (state, actions) => {
        return state;
      },
      handleModalDismiss: (state, actions) => {
        return defaultState;
      }
    },
    events: {
      loaded: async (state, actions) => {
        // const { autoRetrieveCredentials } = await getSettings();

        browser.runtime.onMessage.addListener(msg => {
          switch (msg.type) {
            case T.FILL_USERNAME:
              actions.fillUsername();
              return true;
            case T.FILL_PASSWORD:
              actions.fillPassword();
              return true;
            case T.CHOOSE_CREDENTIALS_FIELDS:
              actions.chooseCredentialFields();
              return true;
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
    root: appRoot
  });
};

document.onreadystatechange = event => {
  if (document.readyState !== 'complete') {
    return;
  }

  run();
};
