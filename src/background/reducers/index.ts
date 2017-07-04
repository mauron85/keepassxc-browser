import { Reducer } from 'redux';
import * as T from '../../common/actionTypes';

export type Action = {
  type: string,
  payload?: any  
}

export type State = {
  publicKey: string | null;
  secretKey: string | null;
  serverPublicKey: string | null;
  associatedDatabases: { [key: string]: {id: string, key: string } }
}

const defaultState = {
  publicKey: null,
  secretKey: null,
  serverPublicKey: null,
  associatedDatabases: {}
} as State;

const rootReducer: Reducer<State> = (state: State = defaultState, action: Action): State => {
  switch (action.type) {
    case T.NEW_KEY_PAIR:
      return Object.assign({}, state, action.payload);
    case T.NEW_SERVER_PUBLIC_KEY:
      return Object.assign({}, state, { serverPublicKey: action.payload });
    case T.KEY_EXCHANGE_FAILED:
      return Object.assign({}, defaultState, { associatedDatabases: state.associatedDatabases });
  }
  return state;
};

export default rootReducer;
