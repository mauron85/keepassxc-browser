/* globals window */
import { h } from 'hyperapp';
import getBrowser from '../common/browser';
import * as T from '../common/actionTypes';

const browser = getBrowser();

const specifyCredentialsFields = () => {
  browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      type: T.CHOOSE_CREDENTIALS_FIELDS
    });
    window.close();
  });
};

const openOptionsPage = () => {
  browser.runtime.openOptionsPage();
  window.close();
};

const Popup = (props, children) => {
  return (
    <div className="popup">
      <div id="settings" className="settings">
        <button
          className="btn btn-sm btn-b"
          onclick={specifyCredentialsFields}
        >
          Set credential fields for this page
        </button>
      </div>
      {children}
      <div className="popup__footer">
        <a href="#" className="link" onclick={openOptionsPage}>
          Extension options
        </a>
      </div>
    </div>
  );
};

export default Popup;
