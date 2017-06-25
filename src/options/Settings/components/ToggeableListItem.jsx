import React from 'react';
import { ListItem } from 'material-ui/List';
import Toggle from 'material-ui/Toggle';
import { getUIStyles } from '../uiStyles';

const ToggeableListItem = ({
  primaryText,
  secondaryText,
  toggleName,
  toggled,
  onToggle,
  children
}) => {
  const uiStyles = getUIStyles();
  return (
    <ListItem
      rightToggle={
        <Toggle name={toggleName} toggled={toggled} onToggle={onToggle} />
      }
    >
      <div>
        {primaryText}
      </div>
      <div style={uiStyles.secondaryText}>
        {secondaryText}
      </div>
      {toggled &&
        <div>
          {children}
        </div>}
    </ListItem>
  );
};

export default ToggeableListItem;
