import { h } from 'hyperapp';

const DbClosed = props => {
  return (
    <div className="popup__content">
      <div className="popup__message">
        KeePassXC database seems to be closed. Please open.
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

export default DbClosed;
