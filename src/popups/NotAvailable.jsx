import { h } from 'hyperapp';

const NotAvailable = props => {
  return (
    <div className="popup__content">
      <div className="popup__message">
        Cannot connect to KeePassXC. Check if app is running.
      </div>
      <div className="popup__actions">
        <button
          className="btn btn-sm btn-a"
          onclick={props.onReconnect}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default NotAvailable;
