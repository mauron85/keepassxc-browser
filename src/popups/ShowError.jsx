import { h } from 'hyperapp';

const ShowError = ({ trace, error, onReconnect }) =>
  <div className="popup__content">
    <div className="popup__message popup__message--error">
      keepassxc-browser has encountered an error:
      <div className="error">
        <code className="error__message">{error}</code>
      </div>
      {trace &&
        <div className="error">
          <code className="error__message">{trace}</code>
        </div>}
    </div>
    <div className="popup__actions">
      <button
        className="btn btn-sm btn-a"
        onclick={onReconnect}
      >
        Reload
      </button>
    </div>
  </div>;

export default ShowError;
