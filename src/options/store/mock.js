/* globals localStorage */

let keyRing = {
  abcdf: {
    id: 'keepassxc',
    key: 'aWfsV/9Ff4BsrB2a8ddYAQfwE9QB5UjCDJH0zM/3p8M=',
    lastUsed: '2017-06-23T08:06:08.218Z',
    created: '2017-06-23T08:00:00.000Z'
  },
  fghji: {
    id: 'keepassxc-2',
    key: 'aWfsV/9Ff4BsrB2a8ddYAQfwE9QB5UjCDJH0zM/3p8M=',
    lastUsed: '2017-06-13T08:06:08.218Z',
    created: '2017-05-13T08:00:00.000Z'
  }
};

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
  return keyRing;
}

export function setKeyRing(_keyRing) {
  keyRing = _keyRing;
}
