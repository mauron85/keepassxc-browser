import { h } from 'hyperapp';

const DbClosed = props => {
  return (
    <div class="popup__content">
      <div class="popup__message">
        KeePassXC database seems to be closed. Please open.
      </div>
      <div class="popup__actions">
        <button
          id="reload-status-button"
          class="btn btn-sm btn-a"
          onclick={props.onReconnect}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default DbClosed;
