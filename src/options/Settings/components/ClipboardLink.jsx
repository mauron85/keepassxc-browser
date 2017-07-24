import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import Tooltip from 'material-ui/internal/Tooltip';
import copy from 'copy-to-clipboard';

const messages = defineMessages({
  copyLink: {
    id: 'clipboard.copyLink',
    defaultMessage: 'Copy link to clipboard'
  },
  linkCopied: {
    id: 'clipboard.linkCopied',
    defaultMessage: 'Copied to clipboard!'
  }
});

const styles = {
  copyLink: {
    display: 'inline-block',
    position: 'relative'
  },
};

class ClipboardLink extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    href: PropTypes.string.isRequired
  };

  state = {
    copiedToClipboard: false
  };

  render() {
    const { href } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div style={styles.copyLink}>
        <a
          href={href}
          style={styles.clipboard}
          title={formatMessage(messages.copyLink)}
          onClick={event => {
            event.preventDefault();
            copy(href);
            this.setState({ copiedToClipboard: true });
            setTimeout(() => {
              this.setState({ copiedToClipboard: false });
            }, 3000);
          }}
        >
          {href}
        </a>
        <Tooltip
          touch
          show={this.state.copiedToClipboard}
          style={{ right: 0, top: 56 }}
          label={formatMessage(messages.linkCopied)}
          horizontalPosition="left"
          verticalPosition="top"
        />
      </div>
    );
  }
}

export default injectIntl(ClipboardLink);
