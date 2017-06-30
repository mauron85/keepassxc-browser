/* globals localStorage */

const OPTIONS_KEY = 'settings';
const KEYRING_KEY = 'keyRing';

/**
 * @typedef {object} Options
 * @property {number} blinkTimeout
 * @property {number} blinkMinTimeout
 * @property {number} allowedRedirect
 * @property {boolean} usePasswordGenerator
 * @property {boolean} autoRetrieveCredentials
 * @property {boolean} autoFillSingleEntry
 * @property {boolean} autoCompleteUsernames
 * @property {boolean} autoFillAndSend
 * @property {number} checkUpdateKeePassXC
 */
/** @type {Options} */
const defaultOptions = {
  blinkTimeout: 7500,
  blinkMinTimeout: 2000,
  allowedRedirect: 1,
  usePasswordGenerator: true,
  autoRetrieveCredentials: true,
  autoFillSingleEntry: false,
  autoCompleteUsernames: true,
  autoFillAndSend: true,
  checkUpdateKeePassXC: 3
};

/** @return {Options} - options */
export function getOptions() {
  const optionsString = localStorage.getItem(OPTIONS_KEY);
  if (optionsString) {
    /** @type {Options} */
    const options = JSON.parse(optionsString);
    return options;
  }
  return defaultOptions;
}


/** @param {Options} - options object */
export function setOptions(options) {
  localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
}

export function getKeyRing() {
  const keyRing = localStorage.getItem(KEYRING_KEY);
  if (keyRing) {
    return JSON.parse(KEYRING_KEY);
  }
  return {};
}

export function setKeyRing(keyRing) {
  localStorage.setItem(KEYRING_KEY, JSON.stringify(keyRing));
}
