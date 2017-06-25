if (process && process.env.NODE_ENV === 'production') {
  module.exports = require('./store');
} else {
  module.exports = require('./mock');
}
