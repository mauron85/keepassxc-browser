import { h } from 'hyperapp';

const NotConfigured = props =>
  <div class="popup__content">
    <div class="popup__message">
      keepassxc-browser has not been configured. Press the connect button to
      register and pair with KeePassXC.
    </div>
    <div class="popup__actions">
      <button
        id="connect-button"
        class="btn btn-sm btn-a"
        onclick={props.onConfigure}
      >
        Connect
      </button>
    </div>
  </div>;

export default NotConfigured;
