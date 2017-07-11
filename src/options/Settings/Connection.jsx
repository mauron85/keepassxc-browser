import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
  intlShape,
  defineMessages,
  injectIntl
} from 'react-intl';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Warning from 'material-ui/svg-icons/alert/warning';
import { amberA700 } from 'material-ui/styles/colors';
import { getUIStyles } from './uiStyles';

const messages = defineMessages({
  connection: {
    id: 'settings.connection.connection',
    defaultMessage: 'Connection to KeePassXC'
  },
  connectionDesc: {
    id: 'settings.connection.connectionDesc',
    defaultMessage:
      'Select connection protocol and port for communication with KeePassXC app'
  },
  protocol: {
    id: 'settings.connection.protocol',
    defaultMessage: 'Connection protocol'
  },
  httpClient: {
    id: 'settings.connection.httpClient',
    defaultMessage: 'HTTP'
  },
  nativeClient: {
    id: 'settings.connection.nativeClient',
    defaultMessage: 'Native Client'
  },
  port: {
    id: 'settings.connection.port',
    defaultMessage: 'Port'
  },
  checkConnection: {
    id: 'settings.connection.checkConnection',
    defaultMessage: 'Check connection'
  },
  connectionSuccesful: {
    id: 'settings.connection.connectionSuccesful',
    defaultMessage: 'Connection succesful. Last checked at:'
  }
});

const styles = {
  list: {
    padding: 0,
    margin: 0,
    marginTop: 25,
    marginLeft: 25,
    listStyle: 'none'
  },
  listItem: {
    marginBottom: 15
  },
  inputOffset: {
    marginLeft: 20
  },
  warnText: {
    display: 'inline-block',
    verticalAlign: 'text-bottom',
    lineHeight: '24px',
    marginLeft: 10,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.54)'
  },
  progress: {
    display: 'inline-block',
    verticalAlign: 'middle'
  }
};

const Connection = ({ intl, ...props }) => {
  const {
    clientType,
    port,
    isCheckingConnection,
    lastSuccessfulConnectionAt,
    onChange,
    onTestConnect
  } = props;
  const { formatMessage } = intl;
  const uiStyles = getUIStyles();

  const handleChange = (event, value) => {
    onChange(event.target.name, value);
  };

  return (
    <div>
      <List>
        <ListItem disabled>
          <div>
            {formatMessage(messages.connection)}
          </div>
          <div style={uiStyles.secondaryText}>
            {formatMessage(messages.connectionDesc)}
          </div>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <div style={uiStyles.secondaryText}>
                {formatMessage(messages.protocol)}
              </div>
              <div style={styles.cols}>
                <DropDownMenu
                  name="clientType"
                  value={clientType}
                  onChange={(event, key, value) => onChange('clientType', value)}
                >
                  <MenuItem
                    value="http"
                    primaryText={formatMessage(messages.httpClient)}
                  />
                  <MenuItem
                    value="nacl"
                    primaryText={formatMessage(messages.nativeClient)}
                  />
                </DropDownMenu>
              </div>
            </li>
            {clientType === 'nacl' &&
            <li style={styles.listItem}>
              <div style={styles.warn}>
                <Warning color={amberA700} />
                <span style={styles.warnText}>
                  This protocol is not part of official KeePassXC yet.{' '}
                  <a href="https://github.com/varjolintu/keepassxc/releases">
                    Download KeePassXC with NativeClient support
                  </a>
                </span>
              </div>
            </li>
            }
            <li style={styles.listItem}>
              <div style={uiStyles.secondaryText}>
                {formatMessage(messages.port)}
              </div>
              <div style={styles.inputOffset}>
                <TextField
                  name="port"
                  type="number"
                  value={port}
                  onChange={handleChange}
                />
              </div>
            </li>
            <li style={styles.listItem}>
              <FlatButton
                disabled={isCheckingConnection}
                label={formatMessage(messages.checkConnection)}
                onTouchTap={onTestConnect}
              />
            </li>
            <li>
              {(() => {
                if (lastSuccessfulConnectionAt === -1) {
                  return null;
                }
                const lastCheckedAt = new Date(lastSuccessfulConnectionAt);
                return (
                  <div style={uiStyles.secondaryText}>
                    <span>
                      <FormattedMessage {...messages.connectionSuccesful} />
                      {' '}
                      <FormattedDate value={lastCheckedAt} />{' '}
                      <FormattedTime value={lastCheckedAt} />
                    </span>
                  </div>
                );
              })()}
            </li>
          </ul>
        </ListItem>
      </List>
    </div>
  );
};

Connection.propTypes = {
  intl: intlShape.isRequired,
  clientType: PropTypes.string.isRequired,
  port: PropTypes.number.isRequired,
  isCheckingConnection: PropTypes.bool.isRequired,
  lastSuccessfulConnectionAt: PropTypes.number.isRequired,
  onTestConnect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default injectIntl(Connection);
