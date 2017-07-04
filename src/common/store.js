/* globals localStorage */

const SETTINGS_KEY = 'settings';
const KEYRING_KEY = 'keyRing';

/**
 * @typedef {Object} Settings
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
/** @type {Settings} */
export const defaultSettings = {
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

/**
 * @typedef KeePassDb
 * @type {Object}
 * @property {string} id
 * @property {string} key
 */

/**
 * @typedef AssociatedDatabases
 * @type {Object.<string, KeePassDb>}
 */


/** @return {Settings} - settings */
export function getSettings() {
  const settingsString = localStorage.getItem(SETTINGS_KEY);
  if (settingsString) {
    /** @type {Settings} */
    const settings = JSON.parse(settingsString);
    return Object.assign({}, defaultSettings, settings);
  }
  return defaultSettings;
}


/** @param {Settings} settings object */
export function setSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** @return {AssociatedDatabases} - associated databases */
export function getKeyRing() {
  const keyRing = localStorage.getItem(KEYRING_KEY);
  if (keyRing) {
    return JSON.parse(KEYRING_KEY);
  }
  return {};
}

/** @param {AssociatedDatabases} keyRing associated databases */
export function setKeyRing(keyRing) {
  localStorage.setItem(KEYRING_KEY, JSON.stringify(keyRing));
}
