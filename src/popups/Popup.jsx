import { h } from 'hyperapp';

const browser = window.msBrowser || window.browser || window.chrome;

const specifyCredentialsFields = () => {
  browser.runtime.getBackgroundPage(global => {
    // TODO:
    browser.tabs.sendMessage(global.page.currentTabId, {
      action: 'choose_credential_fields'
    });
    close();
  });
};

const openOptionsPage = () => {
  browser.runtime.openOptionsPage();
  close();
};

const Popup = (props, children) => {
  const { showUpdateNotice = false } = props || {};
  return (
    <div class="popup">
      <div id="settings" class="settings">
        <button
          id="btn-choose-credential-fields"
          class="btn btn-sm btn-b"
          onclick={specifyCredentialsFields}
        >
          Set credential fields for this page
        </button>
        {showUpdateNotice &&
          <div class="update-available">
            You use an old version of KeePassXC.
            <br />
            <a target="_blank" href="https://keepassxc.org/download">
              Please download the latest version from keepassxc.org
            </a>.
          </div>}
      </div>
      {children}
      <div class="popup__footer">
        <a href="#" class="link" onclick={openOptionsPage}>
          Extension options
        </a>
      </div>
    </div>
  );
};

export default Popup;
