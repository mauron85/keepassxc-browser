import React from 'react';
import {
  intlShape,
  defineMessages,
  injectIntl
} from 'react-intl';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

const messages = defineMessages({
  inserPassword: {
    id: 'settings.shortcuts.inserPassword',
    defaultMessage: 'Insert password only'
  },
  inserPasswordDesc: {
    id: 'settings.shortcuts.inserPasswordDesc',
    defaultMessage: 'Insert only password into the field where your focus is'
  },
  inserUserNamePassword: {
    id: 'settings.shortcuts.inserUserNamePassword',
    defaultMessage: 'Insert username and password'
  },
  inserUserNamePasswordDesc: {
    id: 'settings.shortcuts.inserUserNamePasswordDesc',
    defaultMessage:
      'Insert username and password into the fields where your focus is'
  }
});

const styles = {
  shortcut: {
    display: 'flex'
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

function makeShortcut(keys) {
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
      <div style={styles.shortcut}>{buttons}</div>
    </div>
  );
}

const Shortcuts = ({ intl: { formatMessage } }) =>
  <div>
    <List>
      <Subheader>Windows/Linux</Subheader>
      <ListItem
        disabled
        primaryText={formatMessage(messages.inserPassword)}
        secondaryText={formatMessage(messages.inserPasswordDesc)}
        secondaryTextLines={2}
        rightIcon={makeShortcut(['Ctrl', 'Shift', 'P'])}
      />
      <Divider />
      <ListItem
        disabled
        primaryText={formatMessage(messages.inserUserNamePassword)}
        secondaryText={formatMessage(messages.inserUserNamePasswordDesc)}
        secondaryTextLines={2}
        rightIcon={makeShortcut(['Ctrl', 'Shift', 'U'])}
      />
    </List>
    <Divider />
    <List>
      <Subheader>Mac</Subheader>
      <ListItem
        disabled
        primaryText={formatMessage(messages.inserPassword)}
        secondaryText={formatMessage(messages.inserPasswordDesc)}
        secondaryTextLines={2}
        rightIcon={makeShortcut(['⌘', 'Shift', 'P'])}
      />
      <Divider />
      <ListItem
        disabled
        primaryText={formatMessage(messages.inserUserNamePassword)}
        secondaryText={formatMessage(messages.inserUserNamePasswordDesc)}
        secondaryTextLines={2}
        rightIcon={makeShortcut(['⌘', 'Shift', 'U'])}
      />
    </List>
  </div>;

Shortcuts.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Shortcuts);
