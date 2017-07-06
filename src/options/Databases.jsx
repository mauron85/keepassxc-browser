import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
  intlShape,
  defineMessages,
  injectIntl
} from 'react-intl';
import {
  Card,
  CardActions,
  CardHeader,
  CardTitle,
  CardText
} from 'material-ui/Card';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';
import { cyan50, cyan500, transparent } from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import BinIcon from './icons/Bin';

const styles = {
  smallIcon: {
    width: 18,
    height: 18
  },
  small: {
    width: 25,
    height: 25,
    padding: 24
  },
  actions: {
    height: 64,
    lineHeight: '64px',
    marginTop: 25
  },
  actionButtons: {
    marginLeft: 12,
    paddingTop: 12,
    paddingBottom: 12
  },
  row: {
    padding: 0,
    paddingLeft: 25,
    paddingRight: 25
  },
  rowSelected: {
    display: 'flex',
    color: cyan500,
    backgroundColor: cyan50
  },
  rowSelectedText: {
    flex: 1,
    fontSize: 14
  }
};

const messages = defineMessages({
  title: {
    id: 'databases.title',
    defaultMessage: 'Connected Databases'
  },
  subtitle: {
    id: 'databases.subtitle',
    defaultMessage:
      'The following KeePassXC databases are connected to keepassxc-browser'
  },
  norecords: {
    id: 'databases.norecords',
    description: 'Shown when user has no connected databases',
    defaultMessage: 'No connected databases just yet'
  },
  selected: {
    id: 'databases.selected',
    defaultMessage: '{count, plural, one {# item} other {# items}} selected'
  },
  removeConfirmation: {
    id: 'databases.removeConfirmation',
    description: 'Shown when user click on delete button',
    defaultMessage:
      '{count, plural, one {Database} other {Databases}} will be removed'
  },
  removeNotice: {
    id: 'databases.removeNotice',
    defaultMessage:
      "You'll be not able to access credentials from {count, plural, one {this DB} other {these DBs}}, without connecting {count, plural, one {it} other {them}} again."
  },
  cancelBtnLabel: {
    id: 'databases.cancelBtnLabel',
    defaultMessage: 'Cancel'
  },
  removeBtnLabel: {
    id: 'databases.removeBtnLabel',
    defaultMessage: 'Remove'
  }
});

class Databases extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    databases: PropTypes.array.isRequired,
    onConnect: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      showConfirmDialog: false
    };
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleShowRemoveDialog = this.handleShowRemoveDialog.bind(this);
    this.handleCloseRemoveDialog = this.handleCloseRemoveDialog.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleRowSelection(rows) {
    this.setState({ selectedRows: rows });
  }

  handleShowRemoveDialog() {
    this.setState({ showConfirmDialog: true });
  }

  handleCloseRemoveDialog() {
    this.setState({ showConfirmDialog: false });
  }

  handleRemove() {
    const { selectedRows } = this.state;
    const { databases } = this.props;
    let keepDatabases = databases;
    if (selectedRows === 'all') {
      keepDatabases = [];
    } else if (selectedRows.length > 0) {
      keepDatabases = databases.filter(
        (db, index) => !selectedRows.includes(index)
      );
    } else {
      return false;
    }
    this.props.onDelete(keepDatabases);
    this.setState({ selectedRows: [], showConfirmDialog: false });
    return true;
  }

  render() {
    const { selectedRows, showConfirmDialog } = this.state;
    const { formatMessage } = this.props.intl;
    const { databases, onConnect } = this.props;

    const actions = [
      <FlatButton
        primary
        label={formatMessage(messages.cancelBtnLabel)}
        onTouchTap={this.handleCloseRemoveDialog}
      />,
      <FlatButton
        secondary
        label={formatMessage(messages.removeBtnLabel)}
        onTouchTap={this.handleRemove}
      />
    ];

    return (
      <div>
        <div className="header">
          <h2 className="title"><FormattedMessage {...messages.title} /></h2>
        </div>
        <Card expanded>
          {databases.length > 0
            ? <CardText>{formatMessage(messages.subtitle)}</CardText>
            : <CardText>{formatMessage(messages.norecords)}</CardText>}
          <div style={styles.actions}>
            {selectedRows.length > 0
              ? <div style={{ ...styles.row, ...styles.rowSelected }}>
                  <div style={styles.rowSelectedText}>
                    <FormattedMessage
                      {...messages.selected}
                      values={{
                        count: selectedRows.length
                      }}
                    />
                  </div>
                  <IconButton
                    style={styles.small}
                    tooltip="Delete"
                    iconStyle={styles.smallIcon}
                    onTouchTap={this.handleShowRemoveDialog}
                  >
                    <BinIcon color="rgba(0, 0, 0, 0.54)" />
                  </IconButton>
                </div>
              : <div style={styles.actionButtons}>
                  <FlatButton primary label="Connect" onTouchTap={onConnect} />
                </div>}
          </div>
          <div>
            {databases.length > 0 &&
              <Table multiSelectable onRowSelection={this.handleRowSelection}>
                {/*
                  NOTE: displaySelectAll is broken
                  Issue: https://github.com/callemall/material-ui/issues/4385
                  */}
                <TableHeader displaySelectAll={false}>
                  <TableRow>
                    <TableHeaderColumn>ID</TableHeaderColumn>
                    <TableHeaderColumn>Key</TableHeaderColumn>
                    <TableHeaderColumn>Last used</TableHeaderColumn>
                    <TableHeaderColumn>Created</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false}>
                  {databases.map(({ id, hash, lastUsedAt, createdAt }, rowIndex) => {
                    const lastUsedDate = lastUsedAt && new Date(lastUsedAt);
                    const createdDate = createdAt && new Date(createdAt);
                    return (
                      <TableRow
                        key={id}
                        selected={
                          selectedRows === 'all' ||
                          selectedRows.includes(rowIndex)
                        }
                      >
                        <TableRowColumn>{id}</TableRowColumn>
                        <TableRowColumn>{hash}</TableRowColumn>
                        <TableRowColumn>
                          {lastUsedDate &&
                            <span>
                              <FormattedDate value={lastUsedDate} />{' '}
                              <FormattedTime value={lastUsedDate} />
                            </span>}
                        </TableRowColumn>
                        <TableRowColumn>
                          <FormattedDate value={createdDate} />{' '}
                          <FormattedTime value={createdDate} />
                        </TableRowColumn>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>}
          </div>
        </Card>
        <Dialog
          modal
          title={formatMessage(messages.removeConfirmation, {
            count: selectedRows.length
          })}
          actions={actions}
          open={showConfirmDialog}
        >
          <FormattedMessage
            {...messages.removeNotice}
            values={{
              count: selectedRows.length
            }}
          />
        </Dialog>
      </div>
    );
  }
}

export default injectIntl(Databases);
