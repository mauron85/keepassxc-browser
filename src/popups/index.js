import render from './main';

render();
if (module.hot) {
  module.hot.accept('./main.jsx', () => {
    console.log('Accepting the updated library module!');
    render();
  });
}
