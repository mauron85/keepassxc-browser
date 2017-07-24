import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'material-ui/internal/Tooltip';
import copy from 'copy-to-clipboard';
import ClipboardIcon from '../../icons/Clipboard';

const styles = {
  linkRow: {
    marginTop: 10,
    marginBottom: 10
  },
  link: {
    display: 'inline-block',
    border: '1px solid #ccc',
    borderRadius: 3
  },
  url: {
    display: 'inline-block',
    verticalAlign: 'text-bottom',
    paddingLeft: 8,
    paddingRight: 8,
    color: '#000',
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '12px'
  },
  clipboard: {
    display: 'inline-block',
    width: 30,
    height: 30,
    margin: 0,
    padding: 0,
    paddingLeft: 6,
    border: 0,
    outline: 0,
    cursor: 'pointer',
    verticalAlign: 'sub',
    backgroundColor: '#eff3f6'
  }
};

export default class ClipboardLink extends Component {
  static propTypes = {
    href: PropTypes.string.isRequired
  }

  state = {
    copiedToClipboard: false
  }

  render() {
    const { href } = this.props;
    return (
      <div style={styles.link}>
        <div style={styles.url}>{href}</div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            style={styles.clipboard}
            title="Copy to clipboard"
            onClick={() => {
              copy(href);
              this.setState({ copiedToClipboard: true });
              setTimeout(() => {
                this.setState({ copiedToClipboard: false });
              }, 3000);
            }}
          >
            <ClipboardIcon />
          </button>
          <Tooltip
            touch
            show={this.state.copiedToClipboard}
            style={{ right: 0, top: 56 }}
            label="Copied!"
            horizontalPosition="left"
            verticalPosition="top"
          />
        </div>
      </div>
    );
  }
}
