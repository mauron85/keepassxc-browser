export function getPluginVersion() {
  return '0.2.0';
}

export function getKeepassXCVersions() {
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
