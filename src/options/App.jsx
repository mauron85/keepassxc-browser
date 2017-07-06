import pick from 'lodash/pick';
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
import browser from '../common/browser';
import * as T from '../common/actionTypes';
import { defaultSettings } from '../common/store';
import { getSettings, getAssociatedDatabases, getCredentialFields } from './actions';

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

class App extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      settings: null,
      associatedDatabases: [],
      credentialFields: [],
      showSnack: false,
      slideIndex: 0
    };

    Promise.all([
      getSettings(),
      getCredentialFields(),
      getAssociatedDatabases(),
    ])
    .then(([settings, credentialFields, associatedDatabases]) => {
      this.setState({
        settings,
        credentialFields,
        associatedDatabases
      });
    });

    this.port = browser.runtime.connect({ name: 'options' });
  }

  handleTabChange = value => {
    this.setState({
      slideIndex: value
    });
  };

  handleSettingsChange = (name, value) => {
    const settings = {
      ...this.state.settings,
      [name]: value
    };
    this.port.postMessage({ type: T.SET_SETTINGS, payload: settings });
    this.setState({ settings });
  };

  handleConnect = () => {
    this.port.postMessage({ type: T.ASSOCIATE });
  };

  handleDatabaseDelete = keepDatabases => {
    const associatedDatabases = keepDatabases.reduce((memo, db) => {
      memo[db.hash] = db;
      return memo;
    }, {});
    this.port.postMessage({
      type: T.SET_ASSOCIATED_DATABASES,
      payload: associatedDatabases
    });
    this.setState({ associatedDatabases: keepDatabases });
  };

  handleCredentialsDelete = keepCredentials => {
    const currentCredentialFields = this.state.credentialFields;
    const pageUrls = keepCredentials.map(cred => cred.pageUrl);
    const newCredentialFields = pick(currentCredentialFields, pageUrls);
    this.port.postMessage({
      type: T.SET_CREDENTIAL_FIELDS,
      payload: newCredentialFields
    });
    this.setState({ credentialFields: keepCredentials });
  };

  render() {
    const {
      slideIndex,
      showSnack,
      settings,
      associatedDatabases,
      credentialFields
    } = this.state;
    const { formatMessage } = this.props.intl;

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
              onSettingChange={this.handleSettingsChange}
            />
          </div>
          <div style={styles.page}>
            <Databases
              databases={associatedDatabases}
              onDelete={this.handleDatabaseDelete}
              onConnect={this.handleConnect}
            />
          </div>
          <div style={styles.page}>
            <Credentials
              credentials={credentialFields}
              onDelete={this.handleCredentialsDelete}
            />
          </div>
          <div style={styles.page}>
            <About />
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
