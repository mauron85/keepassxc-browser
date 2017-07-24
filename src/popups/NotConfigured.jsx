import { h } from 'hyperapp';

const NotConfigured = props =>
  <div className="popup__content">
    <div className="popup__message">
      keepassxc-browser has not been configured. Press the connect button to
      register and pair with KeePassXC.
    </div>
    <div className="popup__actions">
      <button
        className="btn btn-sm btn-a"
        onclick={props.onConfigure}
      >
        Connect
      </button>
    </div>
  </div>;

export default NotConfigured;
