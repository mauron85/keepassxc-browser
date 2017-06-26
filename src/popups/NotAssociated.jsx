import { h } from 'hyperapp';

const NotAssociated = props => {
  const { identifier } = props || {};
  return (
    <div class="popup__content">
      <div class="popup__message">
        keepassxc-browser has been configured using the identifier
        <em>{identifier}</em> and has not yet connected to
        KeePassXC.
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
    </div>
  );
};

export default NotAssociated;
