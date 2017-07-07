import React, { Component } from 'react';
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

let credentialsFixture = [
  {
    id: 1,
    pageUrl: 'https://mail.google.com',
  },
  {
    id: 2,
    pageUrl: 'https://outlook.com'
  }
];
// databases = [];

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
    marginTop: 15
  },
  actionButtons: {
    marginLeft: 12
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
    id: 'credentials.title',
    defaultMessage: 'Specified credential fields'
  },
  subtitle: {
    id: 'credentials.subtitle',
    defaultMessage: `If keepassxc-browser detects the wrong credential fields, you are able to specify the correct fields by yourself. 
Just go to the page and click on the keepassxc-browser-Icon, now select Choose own credential fields for this page. 
On this page you can manage theses specified credential fields.`
  },
  pageUrl: {
    id: 'credentials.pageUrl',
    defaultMessage: 'PageUrl'
  },
  norecords: {
    id: 'credentials.norecords',
    description: 'Shown when user has no page urls',
    defaultMessage: 'No specified credentials'
  },
  selected: {
    id: 'credentials.selected',
    defaultMessage: '{count, plural, one {# item} other {# items}} selected'
  },
  removeConfirmation: {
    id: 'credentials.removeConfirmation',
    description: 'Shown when user click on delete button',
    defaultMessage:
      '{count, plural, one {Credential} other {Credentials}} will be removed'
  },
  removeNotice: {
    id: 'credentials.removeNotice',
    defaultMessage:
      "You'll be not able to access these credentials anymore."
  },
  cancelBtnLabel: {
    id: 'credentials.cancelBtnLabel',
    defaultMessage: 'Cancel'
  },
  removeBtnLabel: {
    id: 'credentials.removeBtnLabel',
    defaultMessage: 'Remove'
  }
});

class Credentials extends Component {
  static propTypes = {
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      showConfirmDialog: false,
      credentials: credentialsFixture
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
    const { credentials, selectedRows } = this.state;
    let keepCredentials = credentials;
    if (selectedRows === 'all') {
      keepCredentials = [];
    } else if (selectedRows.length > 0) {
      keepCredentials = credentials.filter((db, index) =>
        !selectedRows.includes(index)
      );
    } else {
      return false;
    }
    this.setState({
      credentials: keepCredentials,
      selectedRows: [],
      showConfirmDialog: false
    });
    return true;
  }

  render() {
    const { selectedRows, showConfirmDialog, credentials } = this.state;
    const { formatMessage } = this.props.intl;

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
          {credentials.length > 0
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
              : null
              }
          </div>
          <div>
            {credentials.length > 0 &&
              <Table multiSelectable onRowSelection={this.handleRowSelection}>
                {/*
                  NOTE: displaySelectAll is broken
                  Issue: https://github.com/callemall/material-ui/issues/4385
                  */}
                <TableHeader displaySelectAll={false}>
                  <TableRow>
                    <TableHeaderColumn>Page url</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false}>
                  {credentials.map(({ id, pageUrl }, rowIndex) => {
                    return (
                      <TableRow
                        key={id}
                        selected={
                          selectedRows === 'all' ||
                          selectedRows.includes(rowIndex)
                        }
                      >
                        <TableRowColumn>{pageUrl}</TableRowColumn>
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

export default injectIntl(Credentials);
