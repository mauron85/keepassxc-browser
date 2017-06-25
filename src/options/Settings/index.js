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
  CardText
} from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Shortcuts from './Shortcuts';
import GeneralSettings from './GeneralSettings';
import CheckUpdates from './CheckUpdates';
import UnsafeSettings from './UnsafeSettings';

const messages = defineMessages({
  title: {
    id: 'settings.general.title',
    defaultMessage: 'General'
  },
  customizeShortcuts: {
    id: 'settings.general.customizeShortcuts',
    description: 'Title shown in General Settings Card',
    defaultMessage: 'You can customize these shortcuts on {configureUrl} page.'
  },
  shortcuts: {
    id: 'settings.shortcuts',
    defaultMessage: 'Shortcuts'
  },
  installedKeePassXCVersion: {
    id: 'settings.installedKeePassXCVersion',
    defaultMessage: 'Installed KeePassXC: {version}'
  },
  availableKeePassXCVersion: {
    id: 'settings.availableKeePassXCVersion',
    defaultMessage: 'Available KeePassXC: {version}'
  },
  downloadLink: {
    id: 'settings.general.downloadLink',
    defaultMessage:
      'keepassxc-browser needs KeePassXC to retrieve credentials. You can download the latest stable version from here: {link}'
  },
  unsafeSettings: {
    id: 'settings.general.unsafeSettings',
    defaultMessage: 'Unsafe options'
  },
  unsafeSettingsDesc: {
    id: 'settings.general.unsafeSettingsDesc',
    defaultMessage: 'use at your own risk'
  }
});

class Settings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onSettingChange: PropTypes.func.isRequired
  };

  handleChange = (name, value) => {
    this.props.onSettingChange(name, value);
  };

  render() {
    return (
      <div>
        <div className="header">
          <h2 className="title">
            <FormattedMessage {...messages.shortcuts} />
          </h2>
        </div>
        <Card>
          <CardText>
            <Shortcuts />
          </CardText>
          <CardText>
            <FormattedMessage
              {...messages.customizeShortcuts}
              values={{
                configureUrl: (
                  <a href="chrome://extensions/configureCommands">
                    chrome://extensions/configureCommands
                  </a>
                )
              }}
            />
          </CardText>
        </Card>
        <div className="header">
          <h2 className="title"><FormattedMessage {...messages.title} /></h2>
        </div>
        <Card>
          <CardText>
            <GeneralSettings {...this.props} onChange={this.handleChange} />
            <Divider />
            <CheckUpdates {...this.props} onChange={this.handleChange} />
          </CardText>
        </Card>
        <div className="header">
          <h2 className="title">
            <FormattedMessage {...messages.unsafeSettings} />&nbsp;
            <FormattedMessage {...messages.unsafeSettingsDesc} />
          </h2>
        </div>
        <Card>
          <CardText>
            <UnsafeSettings {...this.props} onChange={this.handleChange} />
          </CardText>
        </Card>
      </div>
    );
  }
}

export default injectIntl(Settings);
