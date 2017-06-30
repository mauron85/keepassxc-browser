/* globals window, document */
import { h, app } from 'hyperapp';
import CredentialsMenu from './CredentialsMenu';
import { getFormFields } from './forms';
import browser from '../common/browser';
import * as T from '../common/actionTypes';
import { getOptions } from './actions';

const state = {
  UNKNOWN: -2,
  ERROR: -1,
  INITIAL: 0,
  SHOW_CREDENTIALS_MENU: 1
};

function calcMenuPositionRelativeToElement(el) {
  const { scrollX, scrollY } = window;
  const { top, right, bottom, left, width } = el.getBoundingClientRect();

  return {
    top: bottom + scrollY,
    left: 2 + left + scrollX, // add 2px offset to look better
    width
  };
}

let run = () => {
  const el = document.body.appendChild(document.createElement('div'));
  el.className = 'keepassxc';

  const mockCredentials = [{ id: 1, username: 'john', password: 'wick' }];
  const defaultState = { appState: state.INITIAL };

  app({
    state: defaultState,
    view: (state, actions) => {
      const { appState, menuPosition } = state;
      switch (appState) {
        case state.SHOW_CREDENTIALS_MENU:
          return (
            <CredentialsMenu
              {...menuPosition}
              credentials={mockCredentials}
              onSelect={actions.onSelect}
            />
          );
        default:
          return <div/>;
      }
    },
    actions: {
      setState: (currentState, __, newState) => {
        return Object.assign({}, currentState, newState);
      },
      onSelect: (state, actions, credentialId) => {
        actions.setState(defaultState);
      }
    },
    events: {
      loaded: async (state, actions) => {
        browser.runtime.onMessage.addListener(msg => {
          console.log(msg);
        });
        const options = await getOptions();

        // attach single global event listener
        // only process click on text and email inputs
        document.addEventListener('click', event => {
          if (['text', 'email'].indexOf((event.target as HTMLInputElement).type) > -1) {
            // TODO: add confidence check
            const element = event.target;
            element.addEventListener('blur', () => {
              actions.setState(defaultState);
            }, { once: true });

            const menuPosition = calcMenuPositionRelativeToElement(element);
            actions.setState({ appState: state.SHOW_CREDENTIALS_MENU , menuPosition });
          }
        });

        const [usernameEl, passwordEl] = getFormFields(10);
        if (passwordEl) {
          passwordEl.className += ' keepassxc-password-field';
        }
        if (usernameEl) {
          usernameEl.addEventListener('click', () => {
            const menuPosition = calcMenuPositionRelativeToElement(usernameEl);
            actions.setState({ appState: state.SHOW_CREDENTIALS_MENU , menuPosition });
          });
          usernameEl.addEventListener('blur', () => {
            actions.setState(defaultState);
          });
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
