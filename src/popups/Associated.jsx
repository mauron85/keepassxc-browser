import { h } from 'hyperapp';

const redetectCredentialFields = () => {
  // TODO:
};

const Associated = props => {
  const { identifier } = props || {};
  return (
    <div className="popup__content">
      <div className="popup__message">
        keepassxc-browser has been configured using the identifier &Prime;
        <em>{identifier}</em>&Prime; and is successfully connected to
        KeePassXC.
      </div>
      <div className="popup__actions">
        <button
          className="btn btn-sm"
          onclick={redetectCredentialFields}
        >
          Redetect credential fields
        </button>
      </div>
    </div>
  );
};

export default Associated;
