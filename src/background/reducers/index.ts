import { combineReducers } from 'redux';
import keyReducer from './keys';

export default combineReducers({
  keys: keyReducer,
});
