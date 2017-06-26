import { h } from 'hyperapp';

const InitialState = () =>
  <div class="popup__content">
    <div class="popup__status-check">
      <img
        width="20"
        height="20"
        class="popup__status-check-spinner"
        src="spinner.gif"
      />
      <span>Checking status...</span>
    </div>
  </div>;

export default InitialState;
