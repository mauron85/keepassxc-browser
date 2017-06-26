import { h } from 'hyperapp';
import { sendMessage } from './messaging';

const redetectCredentialFields = () => sendMessage('redetect_fields');

const Associated = props => {
  const { identifier } = props || {};
  return (
    <div class="popup__content">
      <div class="popup__message">
        keepassxc-browser has been configured using the identifier "
        <em>{identifier}</em>" and is successfully connected to
        KeePassXC.
      </div>
      <div class="popup__actions">
        <button
          id="redetect-fields-button"
          class="btn btn-sm"
          onclick={redetectCredentialFields}
        >
          Redetect credential fields
        </button>
      </div>
    </div>
  );
};

export default Associated;
