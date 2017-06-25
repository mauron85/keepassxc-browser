import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, defineMessages, injectIntl } from 'react-intl';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';

const messages = defineMessages({
  autoFillInSingle: {
    id: 'settings.unsafe.autoFillInSingle',
    defaultMessage: 'Automatically fill-in single credentials entry'
  },
  autoFillInSingleDesc: {
    id: 'settings.unsafe.autoFillInSingleDesc',
    defaultMessage:
      'If keepassxc-browser does only receive a single entry from KeePassXC it automatically fills this credentials into the found credential fields'
  }
});

const UnsafeSettings = ({ intl, ...props }) => {
  const { formatMessage } = intl;
  const { autoFillSingleEntry, onChange } = props;

  const handleChange = (event, value) => {
    onChange(event.target.name, value);
  };

  return (
    <List>
      <ListItem
        primaryText={formatMessage(messages.autoFillInSingle)}
        secondaryText={formatMessage(messages.autoFillInSingleDesc)}
        secondaryTextLines={2}
        rightToggle={
          <Toggle
            name="autoFillSingleEntry"
            toggled={autoFillSingleEntry}
            onToggle={handleChange}
          />
        }
      />
    </List>
  );
};

UnsafeSettings.propTypes = {
  intl: intlShape.isRequired,
  autoFillSingleEntry: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export default injectIntl(UnsafeSettings);
