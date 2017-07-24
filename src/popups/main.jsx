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
import InvalidState from './InvalidState';
import sanitizeString from '../common/sanitizeString';
import getBrowser from '../common/browser';
import * as T from '../common/actionTypes';

const allStates = {
  UNKNOWN: 'UNKNOWN',
  ERROR: 'ERROR',
  INITIAL: 'INITIAL',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  DB_CLOSED: 'DB_CLOSED',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  UNRECOGNIZED_ENCRYPTION_KEY: 'UNRECOGNIZED_ENCRYPTION_KEY',
  NOT_ASSOCIATED: 'NOT_ASSOCIATED',
  ASSOCIATED: 'ASSOCIATED'
};

const browser = getBrowser();

export default function render() {
  let port;

  const defaultState = {
    appState: allStates.INITIAL,
    indentifier: '',
    error: null
  };

  app({
    state: defaultState,
    view: (state, actions) => {
      const { appState, error, trace, identifier } = state;
      switch (appState) {
        case allStates.ERROR:
          return (
            <Popup>
              <ShowError
                trace={sanitizeString(trace)}
                error={error}
                onReconnect={actions.reconnect}
              />
            </Popup>
          );
        case allStates.INITIAL:
          return (
            <Popup>
              <InitialState />
            </Popup>
          );
        case allStates.NOT_AVAILABLE:
          return (
            <Popup>
              <NotAvailable onReconnect={actions.reconnect} />
            </Popup>
          );
        case allStates.DB_CLOSED:
          return (
            <Popup>
              <DbClosed onReconnect={actions.reconnect} />
            </Popup>
          );
        case allStates.NOT_CONFIGURED:
          return (
            <Popup>
              <NotConfigured onConfigure={actions.associate} />
            </Popup>
          );
        case allStates.UNRECOGNIZED_ENCRYPTION_KEY:
          return (
            <Popup>
              <NeedReconfigure
                message={error}
                onConfigure={actions.associate}
              />
            </Popup>
          );
        case allStates.NOT_ASSOCIATED:
          return (
            <Popup>
              <NotAssociated onConfigure={actions.reconnect} />
            </Popup>
          );
        case allStates.ASSOCIATED:
          return (
            <Popup>
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
      setState: (currentState, actions, newState) => {
        return Object.assign({}, currentState, newState);
      },
      associate: async (state, actions) => {
        port.postMessage({ type: T.ASSOCIATE });
        return defaultState;
      },
      reconnect: async (state, actions) => {
        port.postMessage({ type: T.RECONNECT });
        return defaultState;
      },
      handleMessage: (state, actions, msg) => {
        switch (msg.type) {
          case T.GET_STATUS_SUCCESS:
            return Object.assign({}, state, { appState: msg.payload.status });
          default:
            return state;
        }
      }
    },
    events: {
      loaded: async (state, actions) => {
        port = browser.runtime.connect({ name: 'popup' });
        port.onMessage.addListener(msg => {
          actions.handleMessage(msg);
        });
        port.postMessage({ type: T.GET_STATUS });
      }
    },
    root: document.getElementById('popup')
  });
}
