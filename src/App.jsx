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
      showSnack: false,
      slideIndex: 0
    };
  }

  handleChange = (value) => {
    this.setState({
      slideIndex: value,
    });
  };

  render() {
    const { slideIndex, showSnack } = this.state;
    const { formatMessage } = this.props.intl;
    return (
      <div>
        <AppBar
          iconElementLeft={<Logo size={48} />}
          title={formatMessage(messages.title)}
          titleStyle={styles.title}
          zDepth={0}
        />
        <Tabs value={slideIndex} onChange={this.handleChange}>
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
            <Settings />
          </div>
          <div style={styles.page}><Databases /></div>
          <div style={styles.page}><Credentials /></div>
          <div style={styles.page}><About /></div>
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
