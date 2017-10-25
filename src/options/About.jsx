import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  intlShape,
  defineMessages,
  injectIntl
} from 'react-intl';
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText
} from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import { pinkA200, transparent } from 'material-ui/styles/colors';
import { GithubIcon, WebsiteIcon } from './icons';
import { getKeePassXCVersion, getPluginVersion } from './actions';

const styles = {
  logos: {
    width: '100%',
    margin: 'auto',
    marginTop: 30,
    marginBottom: 30
  },
  logo: {
    display: 'inline-block',
    width: '50%',
    margin: 'auto'
  },
  copyrights: {
    margin: 0,
    padding: 0,
    marginTop: 40,
    fontSize: 12,
    listStyleType: 'none'
  },
  line: {
    lineHeight: 2
  },
  large: {
    width: 120,
    height: 120,
    padding: 30
  },
  largeIcon: {
    width: 60,
    height: 60
  }
};

const messages = defineMessages({
  contributors: {
    id: 'about.contributors',
    defaultMessage: 'Contributors'
  },
  credits: {
    id: 'about.credits',
    defaultMessage: 'Special thanks'
  },
  license: {
    id: 'about.license',
    defaultMessage: 'License'
  },
  versions: {
    id: 'about.vesions',
    defaultMessage: 'Versions'
  },
  projectPages: {
    id: 'about.projectPages',
    defaultMessage: 'Project pages'
  }
});

const WebStoreLogo = () =>
  <img
    src="icons/ChromeWebStore_Badge_v2_206x58.png"
    alt="available in the chrome web store"
  />;

const GithubLogo = () =>
  <img src="icons/GitHub_Logo.png" alt="fork me on github" />;

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keepassXCVersion: 'N/A',
      pluginVersion: 'N/A'
    };
    Promise.all([
      getKeePassXCVersion(),
      getPluginVersion()
    ])
    .then(([currentVersion, pluginVersion]) => {
      this.setState({ currentVersion, pluginVersion });
    });
  }

  render() {
    const { keepassXCVersion, pluginVersion } = this.state;
    return (
      <div>
        <div className="header">
          <h2 className="title"><FormattedMessage {...messages.contributors} /></h2>
        </div>
        <Card>
          <List>
            <a href="https://github.com/mauron85/">
              <ListItem primaryText="Marián Hello" leftIcon={<GithubIcon />} />
            </a>
            <Divider />
            <a href="https://github.com/varjolintu/">
              <ListItem
                primaryText="Sami Vänttinen"
                leftIcon={<GithubIcon />}
              />
            </a>
          </List>
        </Card>
        <div className="header">
          <h2 className="title"><FormattedMessage {...messages.credits} /></h2>
        </div>
        <Card>
          <List>
            <a href="https://github.com/pfn/passifox">
              <ListItem primaryText="PassIFox/chromeIPass" leftIcon={<GithubIcon />} />
            </a>
            <Divider />
            <a href="https://github.com/redux-saga/redux-saga">
              <ListItem
                primaryText="Redux-Saga"
                leftIcon={<GithubIcon />}
              />
            </a>
            <Divider />
            <a href="https://github.com/hyperapp/hyperapp">
              <ListItem
                primaryText="HyperApp"
                leftIcon={<GithubIcon />}
              />
            </a>
            <Divider />
            <a href="https://github.com/dchest/tweetnacl-js">
              <ListItem
                primaryText="TweetNaCl.js"
                leftIcon={<GithubIcon />}
              />
            </a>
            <Divider />
            <a href="https://github.com/facebook/react">
              <ListItem
                primaryText="React"
                leftIcon={<GithubIcon />}
              />
            </a>
            <Divider />
            <a href="https://github.com/callemall/material-ui">
              <ListItem
                primaryText="Material-UI"
                leftIcon={<GithubIcon />}
              />
            </a>
            <Divider />
            <a href="http://www.freepik.com">
              <ListItem
                primaryText="Icons made by Freepik"
                leftIcon={<WebsiteIcon />}
              />
            </a>
          </List>
        </Card>
        <div className="header">
          <h2 className="title"><FormattedMessage {...messages.versions} /></h2>
        </div>
        <Card>
          <List>
            <ListItem
              disabled
              primaryText={`keepassxc-browser: ${pluginVersion}`}
            />
            <ListItem disabled primaryText={`KeePassXC: ${keepassXCVersion}`} />
          </List>
        </Card>
        <div className="header">
          <h2 className="title"><FormattedMessage {...messages.license} /></h2>
        </div>
        <Card>
          <List>
            <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">
              <ListItem
                primaryText="GPLv3"
              />
            </a>
          </List>
        </Card>
        <div className="header">
          <h2 className="title">
            <FormattedMessage {...messages.projectPages} />
          </h2>
        </div>
        <Card>
          <CardText>
            <div style={styles.logos}>
              <div style={styles.logo}>
                <a href="https://github.com/mauron85/keepassxc-browser">
                  <GithubLogo />
                </a>
              </div>
              <div className="not-allowed" style={styles.logo}>
                <a>
                  <WebStoreLogo />
                </a>
              </div>
            </div>
          </CardText>
        </Card>
        <ul style={styles.copyrights}>
          <li>
            Icons made by{' '}
            <a href="http://www.freepik.com" title="Freepik">
              Freepik
            </a>{' '}
            from{' '}
            <a href="http://www.flaticon.com" title="Flaticon">
              www.flaticon.com
            </a>{' '}
            is
            licensed by{' '}
            <a
              href="http://creativecommons.org/licenses/by/3.0/"
              title="Creative Commons BY 3.0"
              target="_blank"
            >
              CC 3.0 BY
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

About.propTypes = {
  keepassXCVersion: PropTypes.string.isRequired,
  pluginVersion: PropTypes.string.isRequired
};

About.defaultProps = {
  pluginVersion: 'N/A',
  keepassXCVersion: 'N/A'
};
export default injectIntl(About);
