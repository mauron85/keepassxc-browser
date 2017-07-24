import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Shortcuts from './Shortcuts';
import GeneralSettings from './GeneralSettings';
import CheckUpdates from './CheckUpdates';
import UnsafeSettings from './UnsafeSettings';
import Connection from './Connection';
import ClipboardLink from './components/ClipboardLink';

const messages = defineMessages({
  title: {
    id: 'settings.general.title',
    defaultMessage: 'General'
  },
  customizeShortcuts: {
    id: 'settings.general.customizeShortcuts',
    description: 'Title shown in General Settings Card',
    defaultMessage:
      'Due to browse policy shortcuts can be customized on {link} only. Clicking on address will copy it to the clipboard.'
  },
  shortcuts: {
    id: 'settings.shortcuts',
    defaultMessage: 'Shortcuts'
  },
  unsafeSettings: {
    id: 'settings.general.unsafeSettings',
    defaultMessage: 'Unsafe options'
  },
  unsafeSettingsDesc: {
    id: 'settings.general.unsafeSettingsDesc',
    defaultMessage: 'use at your own risk'
  },
  connection: {
    id: 'settings.general.connection',
    defaultMessage: 'Connection'
  }
});

const Settings = ({ onSettingChange, onTestConnect, ...props }) => {
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
              link: (
                <ClipboardLink href="chrome://extensions/configureCommands" />
              )
            }}
          />          
        </CardText>
      </Card>
      <div className="header">
        <h2 className="title">
          <FormattedMessage {...messages.title} />
        </h2>
      </div>
      <Card>
        <CardText>
          <GeneralSettings {...props} onChange={onSettingChange} />
          <Divider />
          <CheckUpdates {...props} onChange={onSettingChange} />
        </CardText>
      </Card>
      <div className="header">
        <h2 className="title">
          <FormattedMessage {...messages.connection} />
        </h2>
      </div>
      <Card>
        <CardText>
          <Connection
            {...props}
            onChange={onSettingChange}
            onTestConnect={onTestConnect}
          />
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
          <UnsafeSettings {...props} onChange={onSettingChange} />
        </CardText>
      </Card>
    </div>
  );
};

Settings.propTypes = {
  onTestConnect: PropTypes.func.isRequired,
  onSettingChange: PropTypes.func.isRequired
};

export default injectIntl(Settings);
