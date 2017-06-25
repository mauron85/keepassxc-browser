/* globals window */

const browser = window.msBrowser || window.browser || window.chrome;

export function loadSettings() {
  browser.runtime.sendMessage({
    action: 'load_settings'
  });
}

export function getPluginVersion() {
  return browser.runtime.getManifest().version;
}

export function getKeepassXCVersions() {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage(
      {
        action: 'get_keepassxc_versions'
      },
      (response = {}) => {
        const { current = 'N/A', latest = 'N/A' } = response;
        resolve({ current, latest });
      }
    );
  });
}

export function checkForKeepassXCUpdates() {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage(
      {
        action: 'check_update_keepassxc'
      },
      (response = {}) => {
        const { current = 'N/A', latest = 'N/A' } = response;
        resolve({ current, latest });
      }
    );
  });
}

export function loadKeyRing() {
  browser.runtime.sendMessage({
    action: 'load_keyring'
  });
}

export function associate() {
  browser.runtime.sendMessage({
    action: 'associate'
  });
}

export function getManifest() {
  return browser.runtime.getManifest();
}
