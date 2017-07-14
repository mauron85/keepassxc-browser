/* globals fetch */
import getBrowser from '../../common/browser';
import * as storage from '../../common/store';
import * as T from '../../common/actionTypes';

const KEEPASSXC_CHANGELOG_URL =
  'https://raw.githubusercontent.com/keepassxreboot/keepassxc/develop/CHANGELOG';

const browser = getBrowser();

export function getShortcuts() {
  return new Promise(resolve => {
    return browser.commands.getAll(resolve);
  });
}

export function getPluginVersion() {
  return browser.runtime.getManifest().version;
}

export function getSettings() {
  return storage.getSettings();
}

export function getAssociatedDatabases() {
  return Object.entries(storage.getAssociatedDatabases()).map(([key, value]) => ({
    hash: key,
    ...value
  }));
}

export function getCredentialFields() {
  return Object.entries(storage.getCredentialFields()).map(([key, value]) => ({
    id: key,
    ...value
  }));
}

export function getKeePassXCVersion() {
  return new Promise(resolve => {
    browser.runtime.sendMessage(
      {
        action: T.GET_KEEPASSXC_VERSION
      },
      (response = {}) => {
        const { version = 'N/A' } = response;
        resolve(version);
      }
    );
  }).catch(() => 'N/A');
}

export function getLatestKeePassXCVersion() {
  return fetch(KEEPASSXC_CHANGELOG_URL)
    .then(response => {
      if (!response.ok) {
        return 'N/A';
      }
      return response.text();
    })
    .then(text => {
      const regexp = /^(\d+\.)?(\d+\.)?(\*|\d+)/;
      const groups = regexp.exec(text);
      return (groups && groups[0]) || 'N/A';
    })
    .catch(() => 'N/A');
}
