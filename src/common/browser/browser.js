/* globals window */
export default function getBrowser() {
  return window.msBrowser || window.browser || window.chrome;
}
