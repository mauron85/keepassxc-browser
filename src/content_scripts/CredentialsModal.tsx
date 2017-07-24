import { h } from 'hyperapp';

const styles = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
};

const CredentialsModal = props => {
  return (
    <div className="keepassxc-modal-wrapper">
      <div className="keepassxc-modal" style={styles.modal}>
        <div className="keepassxc-card">
          <div className="keepassxc-choose-credentials-dialog">
            <div className="keepassxc-choose-credentials-dialog__title">
              1. Choose username field
            </div>
            <ul className="keepassxc-button-group">
              <li className="keepassxc-button-group__button">
                <button onclick={props.onSkip} className="mui-btn mui-btn--primary">Skip</button>
              </li>
              <li className="keepassxc-button-group__button">
                <button onclick={props.onDismiss} className="mui-btn mui-btn--accent">Dismiss</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
