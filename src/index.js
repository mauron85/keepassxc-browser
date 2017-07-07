/* globals document, navigator */
import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { addLocaleData } from 'react-intl';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { deepOrange500 } from 'material-ui/styles/colors';
import en from 'react-intl/locale-data/en';
import App from './App';

// Warn: locales must already exists, but they're not build yet (chicken egg problem)
// The easiest way is to replace this block with: let locales = {};
// and then: npm run build && npm run manage:translations
const locales = {
  sk: () =>
    Promise.all([
      import('react-intl/locale-data/sk'),
      import('./translations/locales/sk.json')
    ])
};

function getUserLanguage() {
  // Define user's language. Different browsers have the user locale defined
  // on different fields on the `navigator` object, so we make sure to account
  // for these different by checking all of them
  const language =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage;
  // Split locales with a region code
  const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

  return [language, languageWithoutRegionCode];
}

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500
  },
  appBar: {
    height: 50
  }
});

const rootEl = document.getElementById('root');
const render = (Component, locale, messages) => {
  console.log('[DEBUG] rendering App', locale, messages);
  ReactDOM.render(
    <AppContainer>
      <IntlProvider locale={locale} messages={messages}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <Component />
        </MuiThemeProvider>
      </IntlProvider>
    </AppContainer>,
    rootEl
  );
};

const run = () => {
  const [language, languageWithoutRegionCode] = getUserLanguage();
  let locale;
  if (locales[language]) {
    locale = language;
  } else if (locales[languageWithoutRegionCode]) {
    locale = languageWithoutRegionCode;
  }
  const getLocale = locales[locale];
  if (typeof getLocale === 'function') {
    getLocale().then(([localeData, messages]) => {
      addLocaleData([...en, ...localeData]);
      render(App, locale, messages);
    });
    return;
  }
  addLocaleData(en);
  render(App, locale);
};

run();
if (module.hot) module.hot.accept('./App', () => run());
