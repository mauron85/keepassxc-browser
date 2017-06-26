import { h } from 'hyperapp';

const NotAvailable = props => {
  return (
    <div class="popup__content">
      <div class="popup__message">
        Cannot connect to KeePassXC. Check if app is running.
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

export default NotAvailable;
