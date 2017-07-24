import { h } from 'hyperapp';

const InitialState = () =>
  <div className="popup__content">
    <div className="popup__status-check">
      <img
        width="20"
        height="20"
        className="popup__status-check-spinner"
        src="spinner.gif"
      />
      <span>Checking status...</span>
    </div>
  </div>;

export default InitialState;
