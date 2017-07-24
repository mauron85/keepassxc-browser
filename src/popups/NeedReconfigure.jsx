import { h } from 'hyperapp';

const NeedReconfigure = props =>
  <div className="popup__content">
    <div className="popup__message">
      keepassxc-browser has been disconnected from KeePassXC.
      <div className="error">
        <code className="error__message">{props.message}</code>
      </div>
      <div>
        Press the reconnect button to establish a new connection.
      </div>
    </div>
    <div className="popup__actions">
      <button
        className="btn btn-sm btn-a"
        onclick={props.onConfigure}
      >
        Reconnect
      </button>
    </div>
  </div>;

export default NeedReconfigure;
