import * as storage from '../../common/store';

export function getShortcuts() {
  return new Promise((resolve) => {
    resolve([
      { name: 'fill_username', description: '', shortcut: 'Ctrl+Shift+U' },
      { name: 'fill_password', description: '', shortcut: 'Ctrl+Shift+P' },
    ]);
  });
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

export function getPluginVersion() {
  return '0.1.0';
}

export function getKeePassXCVersion() {
  console.log('[DEBUG] action: getKeePassXCVersions');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('2.1.4');
    }, 1000);
  });
}

export function getLatestKeePassXCVersion() {
  console.log('[DEBUG] action: getLatestKeePassXCVersion');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('2.1.5');
    }, 1000);
  });
}
