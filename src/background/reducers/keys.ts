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
}

const defaultState = {
  publicKey: null,
  secretKey: null,
  serverPublicKey: null,
} as State;

const keysReducer: Reducer<State> = (state: State = defaultState, action: Action): State => {
  switch (action.type) {
    case T.SET_NEW_KEYS:
      return Object.assign({}, state, action.payload);
    case T.INVALIDATE_KEYS:
      return Object.assign({}, defaultState);
  }
  return state;
};

export default keysReducer;
