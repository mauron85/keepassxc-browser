/* globals process */
if (process && process.env.NODE_ENV === 'production') {
  module.exports = require('./browser');
} else {
  module.exports = require('./mock');
}
