import React, { Component } from 'react';
import {
  intlShape,
  defineMessages,
  injectIntl,
  FormattedMessage
} from 'react-intl';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { getShortcuts } from '../actions';

const messages = defineMessages({
  fill_password: {
    id: 'settings.shortcuts.insertPassword',
    defaultMessage: 'Insert password'
  },
  fill_password_desc: {
    id: 'settings.shortcuts.insertPasswordDesc',
    defaultMessage: 'Insert password into the focused field'
  },
  fill_username: {
    id: 'settings.shortcuts.insertUsername',
    defaultMessage: 'Insert username'
  },
  fill_username_desc: {
    id: 'settings.shortcuts.insertUsernameDesc',
    defaultMessage: 'Insert username into the focused field'
  },
  no_shortut: {
    id: 'settings.shortcuts.noShortut',
    description: 'When no shorcut is assigned display Not set',
    defaultMessage: 'Not set'
  }
});

const styles = {
  shortcut: {
    display: 'flex'
  },
  noShortcut: {
    marginTop: 10,
    fontSize: 16,
    color: '#ccc'
  },
  key: {
    display: 'inline-block',
    padding: 8,
    // minWidth: 20,
    textAlign: 'center',
    fontSize: '12px',
    border: '2px solid #AAA',
    borderRadius: '8px',
    color: '#000',
    backgroundColor: '#CCC'
  },
  keyPlus: {
    lineHeight: '36px',
    marginLeft: 6,
    marginRight: 6
  }
};

function renderShortcut(shortcut) {
  const keys = shortcut.split('+').filter(key => key.length > 0);
  const totalKeys = keys.length;
  const buttons = keys.map((key, index) => {
    const hasNext = index < totalKeys - 1;
    return (
      <div key={key} style={styles.shortcut}>
        <div style={styles.key}>
          <span>{key}</span>
        </div>
        {hasNext && <span style={styles.keyPlus}>+</span>}
      </div>
    );
  });
  return (
    <div style={{ width: 150 }}>
      {buttons.length > 0
        ? <div style={styles.shortcut}>{buttons}</div>
        : <div style={styles.noShortcut}><FormattedMessage {...messages.no_shortut} /></div>}
    </div>
  );
}

class Shortcuts extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { shortcuts: null };
    getShortcuts().then(shortcuts => {
      this.setState({ shortcuts });
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { shortcuts } = this.state;
    if (!shortcuts) {
      return null;
    }
    //makeShortcut(['⌘', 'Shift', 'P']);

    return (
      <List>
        <Subheader>Windows/Linux</Subheader>
        {shortcuts
          .filter(({ name }) => messages[name])
          .map(({ name, shortcut }, index) => {
            const command = messages[name];
            const description = messages[`${name}_desc`];
            return (
              <div>
                <ListItem
                  disabled
                  primaryText={formatMessage(command)}
                  secondaryText={description && formatMessage(description)}
                  secondaryTextLines={2}
                  rightIcon={renderShortcut(shortcut)}
                />
                {index + 1 < shortcuts.length && <Divider />}
              </div>
            );
          })}
      </List>
    );
  }
}

Shortcuts.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Shortcuts);
