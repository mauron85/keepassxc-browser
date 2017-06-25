/* globals localStorage */

export function getSettings() {
  const settings = localStorage.getItem('settings');
  if (settings) {
    return JSON.parse(settings);
  }
  return null;
}

export function setSettings(settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}

export function getKeyRing() {
  const keyRing = localStorage.getItem('keyRing');
  if (keyRing) {
    return JSON.parse(keyRing);
  }
  return {};
}

export function setKeyRing(keyRing) {
  localStorage.setItem('keyRing', JSON.stringify(keyRing));
}
