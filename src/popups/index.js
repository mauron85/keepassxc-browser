import render from './popup.jsx';

render();
if (module.hot) {
  module.hot.accept('./popup.jsx', () => {
    console.log('Accepting the updated library module!');
    render();
  });
}
