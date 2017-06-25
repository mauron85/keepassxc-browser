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

let settings = {
  checkUpdateKeePassXC: 3,
  autoCompleteUsernames: true,
  autoFillAndSend: true,
  usePasswordGenerator: true,
  autoFillSingleEntry: false,
  autoRetrieveCredentials: true,
  blinkTimeout: 2132,
  blinkMinTimeout: 1000,
  allowedRedirect: 1,
  'defined-credential-fields': {
    'https://news.ycombinator.com': {
      username: 'jQuery342845639',
      password: 'jQuery342845640',
      fields: []
    }
  }
};

export function getSettings() {
  return settings;
}

export function setSettings(_settings) {
  settings = _settings;
}

export function getKeyRing() {
  return keyRing;
}

export function setKeyRing(_keyRing) {
  keyRing = _keyRing;
}
