import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  intlShape,
  defineMessages,
  injectIntl
} from 'react-intl';
import { List, ListItem } from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import ToggeableListItem from './components/ToggeableListItem';
import { getKeepassXCVersion, getLatestKeePassXCVersion } from '../actions';

const messages = defineMessages({
  checkUpdates: {
    id: 'settings.updates.checkUpdates',
    defaultMessage: 'Check for updates of KeePassXC'
  },
  checkUpdatesDesc: {
    id: 'settings.updates.checkUpdatesDesc',
    defaultMessage: 'Setup automatic check for KeePassXC updates '
  },
  everyThreeDays: {
    id: 'settings.updates.everyThreeDays',
    defaultMessage: 'every 3 days'
  },
  checkWeekly: {
    id: 'settings.updates.checkWeekly',
    defaultMessage: 'every week'
  },
  checkMonthly: {
    id: 'settings.updates.checkMonthly',
    defaultMessage: 'every month'
  },
  checkNever: {
    id: 'settings.updates.checkNever',
    defaultMessage: 'never'
  },
  checkNow: {
    id: 'settings.updates.checkNow',
    defaultMessage: 'Check now'
  },
  installedKeePassXCVersion: {
    id: 'settings.updates.installedKeePassXCVersion',
    defaultMessage: 'Installed KeePassXC: {version}'
  },
  latestKeePassXCVersion: {
    id: 'settings.updates.latestKeePassXCVersion',
    defaultMessage: 'Available KeePassXC: {version}'
  },
  downloadLink: {
    id: 'settings.updates.downloadLink',
    defaultMessage:
      'keepassxc-browser needs KeePassXC to retrieve credentials. You can download the latest stable version from here: {link}'
  }
});

const styles = {
  intervalDropDown: {
    marginLeft: 25
  },
  updates: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.54)'
  },
  appVersions: {
    margin: 0,
    padding: 0,
    marginBottom: 10,
    listStyleType: 'none',
    lineHeight: '20px'
  }
};


class CheckUpdates extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    checkUpdateKeePassXC: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      currentVersion: 'N/A',
      latestVersion: 'N/A'
    };
  }

  handleToogleUpdateCheck = (event, value) => {
    this.props.onChange(
      'checkUpdateKeePassXC',
      value ? this.props.defaults.checkUpdateKeePassXC : 0
    );
  };

  handleUpdateIntervalChange = (event, key, value) => {
    this.props.onChange('checkUpdateKeePassXC', value);
  };

  handleCheckForUpdates = () => {
    Promise.all([
      getKeepassXCVersion(),
      getLatestKeePassXCVersion()
    ])
    .then(([currentVersion, latestVersion]) => {
      this.setState({ currentVersion, latestVersion });
    });
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { checkUpdateKeePassXC } = this.props;
    const { currentVersion, latestVersion } = this.state;

    return (
      <List>
        <ToggeableListItem
          primaryText={formatMessage(messages.checkUpdates)}
          secondaryText={formatMessage(messages.checkUpdatesDesc)}
          secondaryTextLines={2}
          toggleName="checkUpdateKeePassXC"
          toggled={checkUpdateKeePassXC > 0}
          onToggle={this.handleToogleUpdateCheck}
        >
          <div style={styles.intervalDropDown}>
            <DropDownMenu
              name="checkUpdateKeePassXC"
              value={checkUpdateKeePassXC}
              onChange={this.handleUpdateIntervalChange}
            >
              <MenuItem
                value={3}
                primaryText={formatMessage(messages.everyThreeDays)}
              />
              <MenuItem
                value={7}
                primaryText={formatMessage(messages.checkWeekly)}
              />
              <MenuItem
                value={30}
                primaryText={formatMessage(messages.checkMonthly)}
              />
            </DropDownMenu>
          </div>
          <div style={styles.updates}>
            <ul style={styles.appVersions}>
              <li>
                <FormattedMessage
                  {...messages.installedKeePassXCVersion}
                  values={{
                    version: currentVersion
                  }}
                />
              </li>
              <li>
                <FormattedMessage
                  {...messages.latestKeePassXCVersion}
                  values={{
                    version: latestVersion
                  }}
                />
              </li>
            </ul>
            <div style={styles.intervalDropDown}>
              <FlatButton
                label={formatMessage(messages.checkNow)}
                onTouchTap={this.handleCheckForUpdates}
              />
            </div>
          </div>
          <div style={styles.updates}>
            <FormattedMessage
              {...messages.downloadLink}
              values={{
                link: (
                  <a href="https://keepassxc.org/">
                    https://keepassxc.org/
                  </a>
                )
              }}
            />
          </div>

        </ToggeableListItem>
      </List>
    );
  }
}

export default injectIntl(CheckUpdates);
