import { messages } from './locales/en';
import * as T from '../common/actionTypes';

export const contextMenu = [
  {
    id: 'fill_user_pass',
    title: messages.fill_user_pass,
    contexts: ['editable'],
    actionName: T.FILL_USERNAME_PASSWORD
  },
  {
    id: 'fill_pass_only',
    title: messages.fill_pass_only,
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
