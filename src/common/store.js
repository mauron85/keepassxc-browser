/* globals localStorage */

const SETTINGS_KEY = 'settings';
const ASSOCIATED_DATABASES_KEY = 'associatedDbs';
const CREDENTIAL_FIELDS_KEY = 'credentialFields';

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
export function getAssociatedDatabases() {
  const databases = localStorage.getItem(ASSOCIATED_DATABASES_KEY);
  if (databases) {
    return JSON.parse(databases);
  }
  return {};
}

/** @param {AssociatedDatabases} databases - associated databases */
export function setAssociatedDatabases(databases) {
  localStorage.setItem(ASSOCIATED_DATABASES_KEY, JSON.stringify(databases));
}

/**
 * @param {String} id
 * @param {String} key
 */
export function addAssociatedDatabase(id, key, hash, createdAt = new Date()) {
  const databases = getAssociatedDatabases();
  databases[hash] = { id, key, createdAt };
  setAssociatedDatabases(databases);
}


export function getCredentialFields() {
  const credentialFieldsString = localStorage.getItem(CREDENTIAL_FIELDS_KEY);
  if (credentialFieldsString) {
    return JSON.parse(credentialFieldsString);
  }
  return {};
}
