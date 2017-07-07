import React from 'react';
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
    margin: 'auto',
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
  title: {
    id: 'about.title',
    defaultMessage: 'Contributors'
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
    src="images/ChromeWebStore_Badge_v2_206x58.png"
    alt="available in the chrome web store"
  />;

const GithubLogo = () =>
  <img src="images/GitHub_Logo.png" alt="fork me on github" />;

const About = () =>
  <div>
    <div className="header">
      <h2 className="title"><FormattedMessage {...messages.title} /></h2>
    </div>
    <Card>
      <List>
        <a href="https://github.com/pfn/">
          <ListItem primaryText="Perry Nguyen" leftIcon={<GithubIcon />} />
        </a>
        <Divider />
        <a href="http://lukas-schulze.de/">
          <ListItem primaryText="Lukas Schulze" leftIcon={<WebsiteIcon />} />
        </a>
        <Divider />
        <a href="https://github.com/varjolintu/">
          <ListItem primaryText="Sami Vänttinen" leftIcon={<GithubIcon />} />
        </a>
      </List>
    </Card>
    <div className="header">
      <h2 className="title"><FormattedMessage {...messages.versions} /></h2>
    </div>
    <Card>
      <List>
        <ListItem disabled primaryText="keepassxc-browser: v0.1.10" />
        <ListItem disabled primaryText="KeePassXC: N/A" />
      </List>
    </Card>
    <div className="header">
      <h2 className="title"><FormattedMessage {...messages.projectPages} /></h2>
    </div>
    <Card>
      <CardText>
        <div style={styles.logos}>
          <div style={styles.logo}>
            <a href="https://github.com/varjolintu/keepassxc-browser"><GithubLogo /></a>
          </div>
          <div style={styles.logo}>
            <a href="https://chrome.google.com/webstore/detail/keepassxc-browser/iopaggbpplllidnfmcghoonnokmjoicf"><WebStoreLogo /></a>
          </div>
        </div>
      </CardText>
    </Card>
    <ul style={styles.copyrights}>
      <li style={styles.line}>
        2010-2017 - Perry Nguyen, Lukas Schulze, Sami Vänttinen
      </li>
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
  </div>;

export default injectIntl(About);
