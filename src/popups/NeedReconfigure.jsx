import { h } from 'hyperapp';

const NeedReconfigure = props =>
  <div class="popup__content">
    <div class="popup__message">
      keepassxc-browser has been disconnected from KeePassXC.
      <div class="error">
        <code class="error__message">{props.message}</code>
      </div>
      <div>
        Press the reconnect button to establish a new connection.
      </div>
    </div>
    <div class="popup__actions">
      <button
        id="reconnect-button"
        class="btn btn-sm btn-a"
        onclick={props.onConfigure}
      >
        Reconnect
      </button>
    </div>
  </div>;

export default NeedReconfigure;
