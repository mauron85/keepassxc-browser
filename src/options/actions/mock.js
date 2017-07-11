import * as storage from '../../common/store';

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
  return '0.2.0';
}

export function getKeepassXCVersion() {
  console.log('[DEBUG] action: getKeepassXCVersions');
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
