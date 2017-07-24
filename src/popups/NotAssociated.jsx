import { h } from 'hyperapp';

const NotAssociated = props => {
  const { identifier } = props || {};
  return (
    <div className="popup__content">
      <div className="popup__message">
        keepassxc-browser has been configured using the identifier
        <em>{identifier}</em> and has not yet connected to
        KeePassXC.
      </div>
      <div className="popup__actions">
        <button
          className="btn btn-sm btn-a"
          onclick={props.onConfigure}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default NotAssociated;
