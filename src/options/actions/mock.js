/* globals window */

export function loadSettings() {
  console.log('[DEBUG] action: loadSettings');
}

export function getPluginVersion() {
  return '0.2.0';
}

export function getKeepassXCVersions() {
  console.log('[DEBUG] action: getKeepassXCVersions');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ current: '2.1.4', latest: '2.1.5' });
    }, 1000);
  });
}

export function checkForKeepassXCUpdates() {
  console.log('[DEBUG] action: checkForKeepassXCUpdates');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ current: '2.1.4', latest: '2.1.5' });
    }, 1000);
  });
}

export function loadKeyRing() {
  console.log('[DEBUG] action: loadKeyRing');
}

export function associate() {
  console.log('[DEBUG] action: associate');
}

export function getManifest() {
  console.log('[DEBUG] action: getManifest');
  return {};
}
