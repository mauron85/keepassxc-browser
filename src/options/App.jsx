import React, { Component } from 'react';
import { intlShape, defineMessages, injectIntl } from 'react-intl';
import AppBar from 'material-ui/AppBar';
import Snackbar from 'material-ui/Snackbar';
import { Tabs, Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import Settings from './Settings';
import Databases from './Databases';
import Credentials from './Credentials';
import About from './About';
import { AboutIcon, CogIcon, DatabaseIcon, KeyIcon, Logo } from './icons';
import {
  associate,
  loadSettings,
  getKeepassXCVersions,
  getPluginVersion
} from './actions';
import * as store from './store';

const styles = {
  page: {
    maxWidth: 800,
    margin: 'auto',
    marginTop: 10,
    marginBottom: 80
  },
  title: {
    textTransform: 'uppercase'
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400
  }
};

const messages = defineMessages({
  title: {
    id: 'app.title',
    description: 'Title shown in AppBar',
    defaultMessage: 'keepassxc browser'
  },
  settings: {
    id: 'app.tabs.settings',
    description: 'Settings tab label',
    defaultMessage: 'Settings'
  },
  databases: {
    id: 'app.tabs.databases',
    description: 'Connected Databases tab label',
    defaultMessage: 'Databases'
  },
  credentials: {
    id: 'app.tabs.credentials',
    description: 'Specified credential fields tab label',
    defaultMessage: 'Credentials'
  },
  about: {
    id: 'app.tabs.about',
    description: 'About extension tab label',
    defaultMessage: 'About'
  },
  changesApplied: {
    id: 'app.changesApplied',
    description: 'Show Snackbar after changes has been applied',
    defaultMessage: 'Settings has been applied'
  }
});

const defaultSettings = {
  blinkTimeout: 7500,
  blinkMinTimeout: 2000,
  allowedRedirect: 1,
  usePasswordGenerator: true,
  autoRetrieveCredentials: true,
  autoFillSingleEntry: false,
  autoCompleteUsernames: true,
  checkUpdateKeePassXC: 3,
  autoFillAndSend: true
};

class App extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      appVersions: {
        current: 'N/A',
        latest: 'N/A'
      },
      pluginVersion: 'N/A',
      showSnack: false,
      slideIndex: 0
    };
    this.settings = store.getSettings();
    const keyRing = store.getKeyRing();
    const databases =
      keyRing && Object.keys(keyRing).map(hash => ({ hash, ...keyRing[hash] }));
    this.databases = databases || [];
  }

  componentWillMount() {
    const pluginVersion = getPluginVersion();
    this.setState({ pluginVersion });
    getKeepassXCVersions().then(appVersions => this.setState({ appVersions }));
  }

  handleTabChange = value => {
    this.setState({
      slideIndex: value
    });
  };

  handleSettingChange = (name, value) => {
    this.settings = {
      ...this.settings,
      [name]: value
    };
    store.setSettings(this.settings);
    loadSettings();
    this.forceUpdate();
  };

  handleConnect = () => {
    associate();
  };

  handleDatabaseDelete = (keepDatabases) => {
    this.databases = keepDatabases;
    const keyRing = keepDatabases.reduce((memo, db) => {
      memo[db.hash] = db;
      return memo;
    }, {});
    store.setKeyRing(keyRing);
    this.forceUpdate();
  }

  render() {
    const { slideIndex, showSnack, pluginVersion, appVersions } = this.state;
    const { formatMessage } = this.props.intl;
    const settings = this.settings;
    const databases = this.databases;

    return (
      <div>
        <AppBar
          iconElementLeft={<Logo size={48} />}
          title={formatMessage(messages.title)}
          titleStyle={styles.title}
          zDepth={0}
        />
        <Tabs value={slideIndex} onChange={this.handleTabChange}>
          <Tab
            icon={<CogIcon />}
            label={formatMessage(messages.settings)}
            value={0}
          />
          <Tab
            icon={<DatabaseIcon />}
            label={formatMessage(messages.databases)}
            value={1}
          />
          <Tab
            icon={<KeyIcon />}
            label={formatMessage(messages.credentials)}
            value={2}
          />
          <Tab
            icon={<AboutIcon />}
            label={formatMessage(messages.about)}
            value={3}
          />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div style={styles.page}>
            <Settings
              {...settings}
              defaults={defaultSettings}
              onSettingChange={this.handleSettingChange}
            />
          </div>
          <div style={styles.page}>
            <Databases
              databases={databases}
              onDelete={this.handleDatabaseDelete}
              onConnect={this.handleConnect}
            />
          </div>
          <div style={styles.page}><Credentials /></div>
          <div style={styles.page}>
            <About pluginVersion={pluginVersion} appVersions={appVersions} />
          </div>
        </SwipeableViews>
        <Snackbar
          open={showSnack}
          message={formatMessage(messages.changesApplied)}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default injectIntl(App);
