import pick from 'lodash/pick';
import React, { Component } from 'react';
import { intlShape, defineMessages, injectIntl } from 'react-intl';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import SwipeableViews from 'react-swipeable-views';
import Settings from './Settings';
import Databases from './Databases';
import Credentials from './Credentials';
import About from './About';
import { AboutIcon, CogIcon, DatabaseIcon, KeyIcon, Logo } from './icons';
import getBrowser from '../common/browser';
import * as T from '../common/actionTypes';
import { defaultSettings } from '../common/store';
import {
  getSettings,
  getAssociatedDatabases,
  getCredentialFields
} from './actions';

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
  },
  errorMessage: {
    marginBottom: 10,
    fontWeight: 'bold'
  },
  errorStack: {
    maxHeight: 200,
    overflowY: 'scroll',
    wordBreak: 'break-word',
    backgroundColor: '#eee'
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
  settingsApplied: {
    id: 'app.settingsApplied',
    description: 'Show Snackbar after changes has been applied',
    defaultMessage: 'Settings has been applied'
  },
  associationSuccess: {
    id: 'app.associationSuccess',
    defaultMessage: 'Database successfully associated'
  },
  error: {
    id: 'app.error',
    defaultMessage: 'Error has occured'
  },
  closeBtnLabel: {
    id: 'app.closeBtnLabel',
    defaultMessage: 'Close'
  }
});

class App extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      slideIndex: 0,
      error: null,
      settings: null,
      snackMessage: null,
      credentialFields: [],
      associatedDatabases: []
    };

    Promise.all([
      getSettings(),
      getCredentialFields(),
      getAssociatedDatabases()
    ]).then(([settings, credentialFields, associatedDatabases]) => {
      this.setState({
        settings,
        credentialFields,
        associatedDatabases
      });
    });

    const { formatMessage } = this.props.intl;

    this.port = getBrowser().runtime.connect({ name: 'options' });
    this.port.onMessage.addListener(msg => {
      switch (msg.type) {
        case T.ASSOCIATE_SUCCESS:
          this.setState({
            associatedDatabases: getAssociatedDatabases(),
            snackMessage: formatMessage(messages.associationSuccess)
          });
          return true;
        case T.ASSOCIATE_FAILURE:
          this.setState({ error: msg.payload });
          return true;
        default:
          return false;
      }
    });
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

  handleCloseErrorDialog = () => {
    this.setState({ error: null });
  };

  handleRequestClose = () => {
    this.setState({ snackMessage: null });
  };

  render() {
    const {
      error,
      settings,
      snackMessage,
      slideIndex,
      credentialFields,
      associatedDatabases
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
        <Dialog
          modal
          open={!!error}
          title={formatMessage(messages.error)}
          actions={[
            <FlatButton
              primary
              label={formatMessage(messages.closeBtnLabel)}
              onTouchTap={this.handleCloseErrorDialog}
            />
          ]}
        >
          {error &&
            <div>
              <div style={styles.errorMessage}>{error.message}</div>
              <div style={styles.errorStack}>
                {error.stack && <code>{error.stack}</code>}
              </div>
            </div>}
        </Dialog>
        <Snackbar
          open={!!snackMessage}
          message={snackMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default injectIntl(App);
