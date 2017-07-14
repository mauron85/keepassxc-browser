import { messages } from './locales/en';
import * as T from '../common/actionTypes';

export const contextMenu = [
  {
    id: 'fill_username',
    title: messages.fill_username,
    contexts: ['editable'],
    actionName: T.FILL_USERNAME
  },
  {
    id: 'fill_password',
    title: messages.fill_password,
    contexts: ['editable'],
    actionName: T.FILL_PASSWORD
  },
  {
    id: 'remember_credentials',
    title: messages.remember_credentials,
    contexts: ['editable'],
    actionName: T.REMEMBER_CREDENTIALS
  },
  {
    id: 'activate_password_generator',
    title: messages.activate_password_generator,
    contexts: ['editable'],
    actionName: T.ACTIVATE_PASSWORD_GENERATOR
  }
];
