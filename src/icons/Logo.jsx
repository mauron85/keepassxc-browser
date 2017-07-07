import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ size, ...props }) =>
  <img width={size} height={size} src={`images/keepassxc_${size}x${size}.png`} alt="Logo" {...props} />;

Logo.propTypes = {
  size: PropTypes.number
};

Logo.defaultProps = {
  size: 48
};

export default Logo;
