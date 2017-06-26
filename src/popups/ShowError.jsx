import { h } from 'hyperapp';

const ShowError = ({ trace, error, onReconnect }) =>
  <div class="popup__content">
    <div class="popup__message popup__message--error">
      keepassxc-browser has encountered an error:
      <div class="error">
        <code class="error__message">{error}</code>
      </div>
      {trace &&
        <div class="error">
          <code class="error__message">{trace}</code>
        </div>}
    </div>
    <div class="popup__actions">
      <button
        id="reload-status-button"
        class="btn btn-sm btn-a"
        onclick={onReconnect}
      >
        Reload
      </button>
    </div>
  </div>;

export default ShowError;
